/**
 * The following file was borrowed from the MapLabel project, which original
 * source code is available at:
 *
 *     https://github.com/googlemaps/js-map-label
 *
 * Here's a copy of its license:
 *
 * Copyright 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Map Label.
 *
 * @author lukem@google.com (Luke Mahe)
 * @author cbro@google.com (Chris Broadfoot)
 *
 * Integration to OL3-Google-Maps:
 * @author adube@mapgears.com (Alexandre Dubé)
 */

goog.provide('olgm.gm.MapLabel');

/** @suppress {extraRequire} */
goog.require('ol.has');
goog.require('olgm.gm.MapElement');


/**
 * Creates a new Map Label
 * @constructor
 * @extends {olgm.gm.MapElement}
 * @param {Object.<string, *>=} opt_options Optional properties to set.
 * @api
 */
olgm.gm.MapLabel = function(opt_options) {

  olgm.gm.MapElement.call(this);

  this.set('font', 'normal 10px sans-serif');
  this.set('textAlign', 'center');
  this.set('textBaseline', 'middle');

  this.set('zIndex', 1e3);

  this.setValues(opt_options);
};
ol.inherits(olgm.gm.MapLabel, olgm.gm.MapElement);


/**
 * Note: mark as `@api` to make the minimized version include this method.
 * @param {string} prop property
 * @api
 */
olgm.gm.MapLabel.prototype.changed = function(prop) {
  switch (prop) {
    case 'fontColor':
    case 'fontFamily':
    case 'fontSize':
    case 'fontWeight':
    case 'strokeColor':
    case 'strokeWeight':
    case 'text':
    case 'textAlign':
    case 'textBaseline':
      this.drawCanvas_();
      break;
    case 'maxZoom':
    case 'minZoom':
    case 'offsetX':
    case 'offsetY':
    case 'position':
      this.draw();
      break;
    default:
      break;
  }
};


/**
 * Draws the label to the canvas 2d context.
 * @private
 */
olgm.gm.MapLabel.prototype.drawCanvas_ = function() {
  var canvas = this.canvas_;
  if (!canvas) {
    return;
  }

  var style = canvas.style;

  var fillStyle = this.get('fontColor');
  if (!fillStyle) {
    return;
  }

  style.zIndex = /** @type {number} */ (this.get('zIndex'));

  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.textBaseline = this.get('textBaseline');
  ctx.strokeStyle = this.get('strokeColor');
  ctx.fillStyle = fillStyle;
  ctx.font = this.get('font');
  ctx.textAlign = this.get('textAlign');

  var text = this.get('text');
  if (text) {
    var x = canvas.width / 2;
    var y = canvas.height / 2;

    var strokeWeight = Number(this.get('strokeWeight'));
    if (strokeWeight) {
      ctx.lineWidth = strokeWeight;
      ctx.strokeText(text, x, y);
    }

    ctx.fillText(text, x, y);
  }
};


/**
 * Note: mark as `@api` to make the minimized version include this method.
 * @api
 */
olgm.gm.MapLabel.prototype.onAdd = function() {
  var canvas = this.canvas_ = document.createElement('canvas');
  var style = canvas.style;
  style.position = 'absolute';

  var ctx = canvas.getContext('2d');
  ctx.lineJoin = 'round';

  this.drawCanvas_();

  var panes = this.getPanes();
  if (panes) {
    panes.markerLayer.appendChild(canvas);
  }
};
