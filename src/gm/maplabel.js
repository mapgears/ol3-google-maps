/**
 * The following file was borrowed from the MapLabel project, which original
 * source code is available at:
 *
 *     http://google-maps-utility-library-v3.googlecode.com/svn/trunk/maplabel
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



/**
 * Creates a new Map Label
 * @constructor
 * @extends {google.maps.OverlayView}
 * @param {Object.<string, *>=} opt_options Optional properties to set.
 * @api
 */
olgm.gm.MapLabel = function(opt_options) {
  this.set('font', 'normal 10px sans-serif');
  this.set('textAlign', 'center');
  this.set('textBaseline', 'middle');

  this.set('zIndex', 1e3);

  this.setValues(opt_options);
};
if (window.google && window.google.maps) {
  goog.inherits(olgm.gm.MapLabel, google.maps.OverlayView);
}


/**
 * @type {boolean}
 * @private
 */
olgm.gm.MapLabel.prototype.drawn_ = false;


/**
 * @type {number}
 * @private
 */
olgm.gm.MapLabel.prototype.height_ = 0;


/**
 * @type {number}
 * @private
 */
olgm.gm.MapLabel.prototype.width_ = 0;


/**
 * Note: mark as `@api` to make the minimized version include this method.
 * @param {string} prop
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
  }
};


/**
 * Draws the label to the canvas 2d context.
 * @private
 */
olgm.gm.MapLabel.prototype.drawCanvas_ = function() {
  var canvas = this.canvas_;
  if (!canvas) return;

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


/**
 * Note: mark as `@api` to make the minimized version include this method.
 * @api
 */
olgm.gm.MapLabel.prototype.draw = function() {

  if (this.drawn_) {
    this.redraw_();
    return;
  }

  var canvas = this.canvas_;
  if (!canvas) {
    // onAdd has not been called yet.
    return;
  }

  var ctx = canvas.getContext('2d');
  var height = ctx.canvas.height;
  var width = ctx.canvas.width;
  this.width_ = width;
  this.height_ = height;

  if (!this.redraw_()) {
    return;
  }

  this.drawn_ = true;
};


/**
 * Note: mark as `@api` to make the minimized version include this method.
 * @return {boolean}
 * @private
 */
olgm.gm.MapLabel.prototype.redraw_ = function() {
  var latLng = /** @type {google.maps.LatLng} */ (this.get('position'));
  if (!latLng) {
    return false;
  }

  var projection = this.getProjection();
  if (!projection) {
    // The map projection is not ready yet so do nothing
    return false;
  }

  var pos = projection.fromLatLngToDivPixel(latLng);
  var height = this.height_;
  var width = this.width_;

  var offsetX = this.get('offsetX') || 0;
  var offsetY = this.get('offsetY') || 0;
  var style = this.canvas_.style;
  style['top'] = (pos.y - (height / 2) + offsetY) + 'px';
  style['left'] = (pos.x - (width / 2) + offsetX) + 'px';

  style['visibility'] = this.getVisible_();

  return true;
};


/**
 * Get the visibility of the label.
 * @private
 * @return {string} blank string if visible, 'hidden' if invisible.
 */
olgm.gm.MapLabel.prototype.getVisible_ = function() {
  var minZoom = /** @type {number} */ (this.get('minZoom'));
  var maxZoom = /** @type {number} */ (this.get('maxZoom'));

  if (minZoom === undefined && maxZoom === undefined) {
    return '';
  }

  var map = this.getMap();
  if (!map) {
    return '';
  }

  var mapZoom = map.getZoom();
  if (mapZoom < minZoom || mapZoom > maxZoom) {
    return 'hidden';
  }
  return '';
};


/**
 * Note: mark as `@api` to make the minimized version include this method.
 * @api
 */
olgm.gm.MapLabel.prototype.onRemove = function() {
  var canvas = this.canvas_;
  if (canvas && canvas.parentNode) {
    canvas.parentNode.removeChild(canvas);
  }
};
