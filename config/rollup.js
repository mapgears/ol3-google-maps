// Rollup configuration for the full build

import noderesolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import {uglify} from 'rollup-plugin-uglify';
import buble from 'rollup-plugin-buble';
import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
  external: [	'ol/extent.js',
		'ol/Feature.js',
	     	'ol/Observable',
		'ol/proj.js',
		'ol/geom/Point.js',
		'ol/geom/Polygon.js',
		'ol/geom/LineString.js',
		'ol/geom/MultiLineString.js',
		'ol/geom/MultiPoint.js',
		'ol/geom/MultiPolygon.js',
		'ol/interaction.js',
		'ol/interaction/DragPan.js',
		'ol/layer/Group.js',
		'ol/layer/Image.js',
		'ol/layer/Tile.js',
		'ol/layer/Vector.js',
		'ol/source/ImageWMS.js',
		'ol/source/TileImage.js',
		'ol/style/Circle.js',
		'ol/style/Style.js',
		'ol/style/Icon.js',
		'ol/style/RegularShape.js'
	    ],
  input: 'build/index.js',
  output: [
    {file: 'build/olgm.js',
     globals: {
         'ol/extent.js': 'ol.extent',
	 'ol/Feature.js': 'ol.Feature',
         'ol/Observable': 'ol.Observable',
	 'ol/proj.js': 'ol.proj',
	 'ol/geom/LineString.js': 'ol.geom.LineString',
	 'ol/geom/MultiLineString.js': 'ol.geom.MultiLineString',
	 'ol/geom/MultiPoint.js': 'ol.geom.MultiPoint',
	 'ol/geom/MultiPolygon.js': 'ol.geom.MultiPolygon',
	 'ol/geom/Point.js': 'ol.geom.Point',
	 'ol/geom/Polygon.js': 'ol.geom.Polygon',
	 'ol/interaction.js': 'ol.interaction',
	 'ol/interaction/DragPan.js': 'ol.interaction.DragPan',
	 'ol/layer/Group.js': 'ol.layer.Group',
	 'ol/layer/Image.js': 'ol.layer.Image',
	 'ol/layer/Tile.js': 'ol.layer.Tile',
	 'ol/layer/Vector.js': 'ol.layer.Vector',
	 'ol/source/ImageWMS.js': 'ol.source.ImageWMS',
	 'ol/source/TileImage.js': 'ol.source.TileImage',
	 'ol/style/Circle.js': 'ol.style.Circle',
	 'ol/style/Icon.js': 'ol.style.Icon',
	 'ol/style/RegularShape.js': 'ol.style.RegularShape',
	 'ol/style/Style.js': 'ol.style.Style'
     },
     format: 'iife',
     sourcemap: true}
  ],
  plugins: [
    noderesolve(),
    commonjs(),
    buble(),
    uglify(),
    sourcemaps()
  ]
};


//Observable,extent_js,proj_js,ImageWMS,TileImage,Feature,Point,Polygon,VectorLayer,Style,LineString,MultiLineString,MultiPolygon,MultiPoint,Circle,Icon,RegularShape,LayerGroup,ImageLayer,TileLayer,interaction_js,DragPan
