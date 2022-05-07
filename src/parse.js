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
/** @typedef {{ bounds?: [number, number], mode?: InterpolationMode }} ParseOptions */
/** @typedef {[number | string, Color]} CptEntry */

const DEFAULT_MODE = /** @type {InterpolationMode} */ ('rgb');
const COLOR_SEPARATOR_REGEX = /[ ,\t:\-\/]+/g;

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
    } else if (value === 'nv') {
      value = null; // GDAL nodata
    } else if (value === 'default') {
      return; // GRASS default (value < min || value > max), not supported yet, ignore
    } else if (value === 'N') {
      value = null; // GMT nodata
    } else if (value === 'B') {
      return; // GMT background (value < min), not supported yet, ignore
    } else if (value === 'F') {
      return; // GMT foreground (value > max), not supported yet, ignore
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
 * @param {string} color
 * @param {InterpolationMode} mode
 * @return {Color}
 */
function parseColor(color, mode) {
  let fields;
  if (typeof color === 'string') {
    fields = color.split(COLOR_SEPARATOR_REGEX);
  } else if (Array.isArray(color)) {
    fields = color;
  } else {
    throw new Error('Invalid state');
  }

  if (fields.length === 1) {
    if (fields[0].match(/\d+/)) {
      // grayscale color
      color = {
        [mode[0]]: parseFloat(fields[0]),
        [mode[1]]: parseFloat(fields[0]),
        [mode[2]]: parseFloat(fields[0]),
      };
    } else {
      // color name
      color = fields[0];
    }
  } else if (fields.length === 3) {
    // color
    color = {
      [mode[0]]: parseFloat(fields[0]),
      [mode[1]]: parseFloat(fields[1]),
      [mode[2]]: parseFloat(fields[2]),
    };
  } else if (fields.length === 4) {
    // color with alpha
    color = {
      [mode[0]]: parseFloat(fields[0]),
      [mode[1]]: parseFloat(fields[1]),
      [mode[2]]: parseFloat(fields[2]),
      a: parseFloat(fields[3]),
    };
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

    if (isFinite(value)) {
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
export function parseCptText(cptText, { bounds = [0, 1], mode = DEFAULT_MODE } = {}) {
  const { cptArray, mode: mode2 } = parseCptTextInternal(cptText);
  return parseCptArray(cptArray, { bounds, mode: mode2 || mode });
}