/*
 * Copyright (c) 2022 WeatherLayers.com
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import chroma from './chroma';

/** @typedef {import('chroma-js').InterpolationMode} InterpolationMode */
/** @typedef {import('chroma-js').Color} Color */
/** @typedef {import('chroma-js').Scale} Scale */
/** @typedef {{ bounds?: [number, number] }} ParseOptions */
/** @typedef {{ color: Color, value: number | undefined }} ColorEntry */

/** @type {InterpolationMode} */
const DEFAULT_MODE = 'rgb';

/**
 * @param {string[]} fields
 * @param {InterpolationMode} mode
 * @param {[number, number]} bounds
 * @returns {ColorEntry}
 */
function parseFields(fields, mode, bounds) {
  if (fields.length === 2) {
    fields = [fields[0], ...fields[1].split(/[-\/]/g)];
  }
  if (fields.length !== 2 && fields.length !== 4 && fields.length !== 5) {
    return; // invalid line, ignore
  }

  let value;
  if (fields[0][fields[0].length - 1] === '%') {
    const percentage = parseFloat(fields[0]) / 100;
    if (percentage < 0 || percentage > 1) {
      throw new Error(`Wrong value for a percentage ${fields[0]}`);
    }
    value = bounds[0] + (bounds[1] - bounds[0]) * percentage;
  } else if (fields[0] === 'nv') {
    value = null; // GDAL nodata
  } else if (fields[0] === 'default') {
    return; // GRASS default (value < min || value > max), not supported yet, ignore
  } else if (fields[0] === 'N') {
    value = null; // GMT nodata
  } else if (fields[0] === 'B') {
    return; // GMT background (value < min), not supported yet, ignore
  } else if (fields[0] === 'F') {
    return; // GMT foreground (value > max), not supported yet, ignore
  } else {
    value = parseFloat(fields[0]);
  }

  let color;
  if (fields.length === 4 || fields.length === 5) {
    // color
    color = {
      [mode[0]]: parseFloat(fields[1]),
      [mode[1]]: parseFloat(fields[2]),
      [mode[2]]: parseFloat(fields[3]),
      ...(fields.length === 5 ? { a: parseFloat(fields[4]) } : {}),
    };
  } else if (fields.length === 2) {
    if (fields[1].match(/\d+/)) {
      // grayscale color
      color = {
        [mode[0]]: parseFloat(fields[1]),
        [mode[1]]: parseFloat(fields[1]),
        [mode[2]]: parseFloat(fields[1]),
      };
    } else {
      // color name
      color = fields[1];
    }
  } else {
    return; // invalid line, ignore
  }

  const entry = { color, value };
  return entry;
}

/**
 * @param {string} line
 * @return {boolean}
 */
function isLineComment(line) {
  return line[0] === '#' || line[0] === '/';
}

/**
 * @param {string[]} lines
 * @return {boolean}
 */
function isGmtLines(lines) {
  return lines.some(line => {
    if (!isLineComment(line)) {
      if (line.includes('-') || line.includes('/')) {
        return true;
      }
    }
    return false;
  });
}

/**
 * @param {string[]} lines
 * @return {InterpolationMode}
 */
function getMode(lines) {
  const modeLine = lines.find(line => isLineComment(line) && line.includes('COLOR_MODEL = '));
  return modeLine && modeLine.match(/COLOR_MODEL = ([a-zA-Z]+)/)[1] || DEFAULT_MODE;
}

/**
 * @param {string} text
 * @param {ParseOptions} [options]
 * @returns {Scale}
 */
export function parseCptText(text, { bounds = [0, 1] } = {}) {
  const lines = text.split('\n');

  const isGmt = isGmtLines(lines);
  const mode = getMode(lines);

  const colors = [];
  const domain = [];
  let nodata;
  /**
   * @param {ColorEntry} entry
   */
  function addEntry(entry) {
    if (!entry) {
      return;
    }

    if (typeof entry.value === 'number') {
      colors.push(entry.color);
      domain.push(entry.value);
    } else if (entry.value === null) {
      nodata = entry.color;
    }
  }

  for (let line of lines) {
    if (isLineComment(line)) {
      continue;
    }

    const fields = line.split(/[ ,\t:]+/);
    if (isGmt && fields.length >= 4) {
      addEntry(parseFields(fields.slice(0, 2), mode, bounds));
      addEntry(parseFields(fields.slice(2, 4), mode, bounds));
    } else {
      addEntry(parseFields(fields, mode, bounds));
    }
  }

  let palette = chroma.scale(colors).domain(domain).mode(mode);
  if (typeof nodata !== 'undefined') {
    palette = palette.nodata(nodata);
  }
  return palette;
}

/**
 * @param {[number, Color][]} array
 * @returns {Scale}
 */
export function parseCptArray(array) {
  const colors = array.map(x => x[1]);
  const domain = array.map(x => x[0]);

  const palette = chroma.scale(colors).domain(domain);
  return palette;
}