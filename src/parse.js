/*
 * Copyright (c) 2022 WeatherLayers.com
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import chroma from './chroma';
import { parseCptTextInternal } from './parse-text';

/** @typedef {import('chroma-js').InterpolationMode} InterpolationMode */
/** @typedef {import('chroma-js').Color} Color */
/** @typedef {import('chroma-js').Scale} Scale */
/** @typedef {{ bounds?: [number, number] }} ParseOptions */
/** @typedef {[number | string, Color]} CptEntry */

const DEFAULT_MODE = /** @type {InterpolationMode} */ ('rgb');

/**
 * @param {string} value
 * @param {[number, number]} bounds
 * @return {number}
 */
function parseValue(value, bounds) {
  if (typeof value === 'string') {
    if (value[value.length - 1] === '%') {
      const percentage = parseFloat(value) / 100;
      if (percentage < 0 || percentage > 1) {
        throw new Error(`Invalid value for a percentage ${value}`);
      }
      value = bounds[0] + (bounds[1] - bounds[0]) * percentage;
    } else if (value === 'N') {
      value = null; // GMT nodata
    } else if (value === 'B') {
      return; // GMT background (value < min), not supported yet, ignore
    } else if (value === 'F') {
      return; // GMT foreground (value > max), not supported yet, ignore
    } else if (value === 'nv') {
      value = null; // GDAL nodata
    } else if (value === 'default') {
      return; // GRASS default (value < min || value > max), not supported yet, ignore
    } else if (value === 'null') {
      value = null; // PostGIS nodata
    } else if (value === 'nodata') {
      value = null; // PostGIS nodata
    } else {
      value = parseFloat(value);
    }
  } else if (typeof value === 'number') {
    value = value;
  } else {
    throw new Error('Invalid state');
  }
  return value;
}

/**
 * @param {string | string[]} color
 * @param {InterpolationMode} mode
 * @return {Color}
 */
function parseColor(color, mode) {
  if (Array.isArray(color)) {
    if (color.length === 4) {
      // color with alpha
      color = {
        [mode[0]]: parseFloat(color[0]),
        [mode[1]]: parseFloat(color[1]),
        [mode[2]]: parseFloat(color[2]),
        a: parseFloat(color[3]) / 255,
      };
    } else if (color.length === 3) {
      // color
      color = {
        [mode[0]]: parseFloat(color[0]),
        [mode[1]]: parseFloat(color[1]),
        [mode[2]]: parseFloat(color[2]),
      };
    } else {
      throw new Error(`Invalid color ${color}`);
    }
  } else if (typeof color === 'string') {
    if (color.match(/\d+/)) {
      // grayscale color
      color = {
        [mode[0]]: parseFloat(color),
        [mode[1]]: parseFloat(color),
        [mode[2]]: parseFloat(color),
      };
    } else {
      // color name, pass through
      color = color;
    }
  } else {
    throw new Error(`Invalid color ${color}`);
  }
  return color;
}

/**
 * @param {CptEntry[]} cptArray
 * @param {ParseOptions} [options]
 * @returns {Scale}
 */
export function parseCptArray(cptArray, { bounds = [0, 1], mode = DEFAULT_MODE } = {}) {
  const colors = [];
  const domain = [];
  let nodata;
  for (let [value, color] of cptArray) {
    value = parseValue(value, bounds);
    color = parseColor(color, mode);

    if (value != null) {
      colors.push(color);
      domain.push(value);
    } else {
      nodata = color;
    }
  }

  let palette = chroma.scale(colors).domain(domain).mode(mode);
  if (typeof nodata !== 'undefined') {
    palette = palette.nodata(nodata);
  }
  return palette;
}

/**
 * @param {string} cptText
 * @param {ParseOptions} [options]
 * @returns {Scale}
 */
export function parseCptText(cptText, { bounds = [0, 1] } = {}) {
  const { cptArray, mode } = parseCptTextInternal(cptText);
  return parseCptArray(cptArray, { bounds, mode });
}