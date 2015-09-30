goog.provide('olgm');

goog.require('goog.events');


/**
 * @param {Array.<goog.events.Key>} listenerKeys
 */
olgm.unlistenAllByKey = function(listenerKeys) {
  listenerKeys.forEach(goog.events.unlistenByKey);
  listenerKeys.length = 0;
};
