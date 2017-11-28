/* Modified version of https://github.com/openlayers/openlayers/blob/master/transforms/module.js */
const relativeMatcher = /^olgm\.?/;

function rename(name) {
  const parts = name.split('.');
  return `_${parts.join('_')}_`;
}

function resolve(fromName, toName) {
  if (relativeMatcher.test(toName)) {
    return resolveRelative(fromName, toName);
  } else {
    return toName.replace(/\./g, '/').toLowerCase();
  }
}

function resolveRelative(fromName, toName) {
  const fromParts = fromName.split('.');
  const toParts = toName.split('.');
  const fromLength = fromParts.length;
  let commonDepth = 1;
  while (commonDepth < fromLength - 2) {
    if (fromParts[commonDepth] === toParts[commonDepth]) {
      ++commonDepth;
    } else {
      break;
    }
  }

  const back = new Array(fromLength - commonDepth).join('../') || './';
  let relative = back + toParts.slice(commonDepth).join('/').toLowerCase();
  if (relative.endsWith('/')) {
    relative += 'index';
  }
  return relative;
}

function getGoogExpressionStatement(identifier) {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: 'goog'
        },
        property: {
          type: 'Identifier',
          name: identifier
        }
      }
    }
  };
}

function getMemberExpression(name) {
  function memberExpression(parts) {
    const dotIndex = parts.lastIndexOf('.');
    if (dotIndex > 0) {
      return {
        type: 'MemberExpression',
        object: memberExpression(parts.slice(0, dotIndex)),
        property: {
          type: 'Identifier',
          name: parts.slice(dotIndex + 1)
        }
      };
    } else {
      return {
        type: 'Identifier',
        name: parts
      };
    }
  }
  return memberExpression(name);
}

function getMemberExpressionAssignment(name) {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'AssignmentExpression',
      left: getMemberExpression(name)
    }
  };
}

module.exports = function(info, api) {
  const j = api.jscodeshift;
  const root = j(info.source);

  // store any initial comments
  const {comments} = root.find(j.Program).get('body', 0).node;

  const replacements = {};

  // remove goog.provide()
  let provide;
  root.find(j.ExpressionStatement, getGoogExpressionStatement('provide'))
      .forEach(path => {
        if (provide) {
          throw new Error(`Multiple provides in ${info.path}`);
        }
        provide = path.value.expression.arguments[0].value;
      }).remove();

  if (!provide) {
    throw new Error(`No provide found in ${info.path}`);
  }
  replacements[provide] = rename(provide);

  // replace provide assignment with variable declarator
  // e.g. `ol.foo.Bar = function() {}` -> `var _ol_foo_Bar_ = function() {}`
  let declaredProvide = false;
  root.find(j.ExpressionStatement, getMemberExpressionAssignment(provide))
      .replaceWith(path => {
        declaredProvide = true;
        const statement = j.variableDeclaration('var', [
          j.variableDeclarator(j.identifier(rename(provide)), path.value.expression.right)
        ]);
        statement.comments = path.value.comments;
        return statement;
      });

  if (!declaredProvide) {
    const body = root.find(j.Program).get('body');
    body.unshift(
        j.variableDeclaration('var', [
          j.variableDeclarator(j.identifier(rename(provide)), j.objectExpression([]))
        ])
    );
  }

  // replace `goog.require('foo')` with `import foo from 'foo'`
  const imports = [];
  root.find(j.ExpressionStatement, getGoogExpressionStatement('require'))
      .forEach(path => {
        const name = path.value.expression.arguments[0].value;
        if (name in replacements) {
          throw new Error(`Duplicate require found in ${info.path}: ${name}`);
        }
        const renamed = rename(name);
        replacements[name] = renamed;
        const resolved = resolve(provide, name);
        let specifier, source;
        if (Array.isArray(resolved)) {
          // import {imported as renamed} from 'source';
          specifier = j.importSpecifier(j.identifier(resolved[1]), j.identifier(renamed));
          source = resolved[0];
        } else {
          // import renamed from 'source';
          specifier = j.importDefaultSpecifier(j.identifier(renamed));
          source = resolved;
        }
        imports.push(j.importDeclaration([specifier], j.literal(source)));
      })
      .remove();

  const body = root.find(j.Program).get('body');
  body.unshift.apply(body, imports);

  // replace all uses of required or provided names with renamed identifiers
  Object.keys(replacements).sort().reverse().forEach(name => {
    if (name.indexOf('.') > 0) {
      root.find(j.MemberExpression, getMemberExpression(name))
          .replaceWith(j.identifier(replacements[name]));
    } else {
      root.find(j.Identifier, {name: name})
          .replaceWith(j.identifier(replacements[name]));
    }
  });

  // add export declaration
  root.find(j.Program).get('body').push(
      j.exportDefaultDeclaration(j.identifier(rename(provide)))
  );

  // replace any initial comments
  root.get().node.comments = comments;

  return root.toSource({quote: 'single'});
};
