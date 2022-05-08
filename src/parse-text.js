/*
 * Copyright (c) 2022 WeatherLayers.com
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/** @typedef {import('chroma-js').InterpolationMode} InterpolationMode */
/** @typedef {[number | string, Color]} CptEntry */

const LINE_SEPARATOR_REGEX = /[ ,\t:]+/g;
const COLOR_SEPARATOR_REGEX = /[\-\/]/g;

/**
 * @param {string} line
 * @return {boolean}
 */
function isLineComment(line) {
  return line.startsWith('#');
}

/**
 * @param {string[]} lines
 * @return {boolean}
 */
function isGmt4Text(lines) {
  return lines.some(line => {
    if (!isLineComment(line)) {
      if (line.split(LINE_SEPARATOR_REGEX).length >= 8) {
        return true;
      }
    }
    return false;
  });
}

/**
 * @param {string[]} lines
 * @return {boolean}
 */
function isGmt5Text(lines) {
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
  return modeLine ? modeLine.match(/COLOR_MODEL = ([a-zA-Z]+)/)[1].toLowerCase() : undefined;
}

/**
 * @param {string} color
 * @return {Color}
 */
function splitColor(color) {
  color = color.split(COLOR_SEPARATOR_REGEX);
  return color.length === 1 ? color[0] : color;
}

/**
 * @param {string} cptText
 * @returns {{ cptArray: CptEntry[], mode: InterpolationMode }}
 */
export function parseCptTextInternal(cptText) {
  const lines = cptText.split('\n');
  const isGmt4 = isGmt4Text(lines);
  const isGmt5 = isGmt5Text(lines);
  const mode = getMode(lines);

  const cptLines = lines.filter(x => !!x && !x.startsWith('#'))
  const cptArray = [];
  for (let cptLine of cptLines) {
    const fields = cptLine.split(LINE_SEPARATOR_REGEX);
    if (isGmt4) {
      if (fields.length === 8 || fields.length === 9) {
        cptArray.push([fields[0], [fields[1], fields[2], fields[3]]]);
        cptArray.push([fields[4], [fields[5], fields[6], fields[7]]]);
      } else if (fields.length === 4 || fields.length === 5) {
        cptArray.push([fields[0], [fields[1], fields[2], fields[3]]]);
      } else {
        // ignore line
      }
    } else if (isGmt5) {
      if (fields.length === 4 || fields.length === 5) {
        cptArray.push([fields[0], splitColor(fields[1])]);
        cptArray.push([fields[2], splitColor(fields[3])]);
      } else if (fields.length === 2 || fields.length === 3) {
        cptArray.push([fields[0], splitColor(fields[1])]);
      } else {
        // ignore line
      }
    } else {
      if (fields.length === 5) {
        cptArray.push([fields[0], [fields[1], fields[2], fields[3], fields[4]]]);
      } else if (fields.length === 4) {
        cptArray.push([fields[0], [fields[1], fields[2], fields[3]]]);
      } else if (fields.length === 2) {
        cptArray.push([fields[0], fields[1]]);
      } else {
        // ignore line
      }
    }
  }

  return { cptArray, mode };
}