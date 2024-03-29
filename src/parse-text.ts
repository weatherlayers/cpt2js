/*
 * Copyright (c) 2022 WeatherLayers.com
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import type { InterpolationMode } from 'chroma-js';

export type PaletteColor = string | number | [string, string, string] | [number, number, number] | [string, string, string, string] | [number, number, number, number];
export type PaletteEntry = [string | number, PaletteColor];
export type PaletteArray = PaletteEntry[];

const LINE_SEPARATOR_REGEX = /[ ,\t:]+/g;
const COLOR_SEPARATOR_REGEX = /[\-\/]/g;

function isLineComment(line: string): boolean {
  return line.startsWith('#');
}

function isGmt4Text(lines: string[]): boolean {
  return lines.some(line => {
    if (!isLineComment(line)) {
      if (line.split(LINE_SEPARATOR_REGEX).length >= 8) {
        return true;
      }
    }
    return false;
  });
}

function isGmt5Text(lines: string[]): boolean {
  return lines.some(line => {
    if (!isLineComment(line)) {
      if (line.match(/\d+\-\d+\-\d+/) || line.match(/\d+\/\d+\/\d+/)) {
        return true;
      }
    }
    return false;
  });
}

function getMode(lines: string[]): InterpolationMode | undefined {
  const modeLine = lines.find(line => isLineComment(line) && line.includes('COLOR_MODEL = '));
  if (modeLine) {
    const match = modeLine.match(/COLOR_MODEL = ([a-zA-Z]+)/);
    if (match) {
      return match[1].toLowerCase() as InterpolationMode;
    }
  }
  return undefined;
}

function splitColor(color: string): PaletteColor {
  const colorArray = color.split(COLOR_SEPARATOR_REGEX);
  return colorArray.length === 1 ? colorArray[0] : colorArray as PaletteColor;
}

export function parsePaletteTextInternal(paletteText: string): { paletteArray: PaletteArray, mode?: InterpolationMode } {
  const lines = paletteText.trim().split('\n');
  const isGmt4 = isGmt4Text(lines);
  const isGmt5 = isGmt5Text(lines);
  const mode = getMode(lines);

  const paletteLines = lines.filter(x => !!x && !x.startsWith('#'))
  const paletteArray: PaletteArray = [];
  for (let paletteLine of paletteLines) {
    const fields = paletteLine.split(LINE_SEPARATOR_REGEX);
    if (isGmt4) {
      if (fields.length === 8 || fields.length === 9) {
        paletteArray.push([fields[0], [fields[1], fields[2], fields[3]]]);
        paletteArray.push([fields[4], [fields[5], fields[6], fields[7]]]);
      } else if (fields.length === 4 || fields.length === 5) {
        paletteArray.push([fields[0], [fields[1], fields[2], fields[3]]]);
      } else {
        // ignore
      }
    } else if (isGmt5) {
      if (fields.length === 4 || fields.length === 5) {
        paletteArray.push([fields[0], splitColor(fields[1])]);
        paletteArray.push([fields[2], splitColor(fields[3])]);
      } else if (fields.length === 2 || fields.length === 3) {
        paletteArray.push([fields[0], splitColor(fields[1])]);
      } else {
        // ignore
      }
    } else {
      if (fields.length === 5) {
        paletteArray.push([fields[0], [fields[1], fields[2], fields[3], fields[4]]]);
      } else if (fields.length === 4) {
        paletteArray.push([fields[0], [fields[1], fields[2], fields[3]]]);
      } else if (fields.length === 2) {
        paletteArray.push([fields[0], fields[1]]);
      } else {
        // ignore
      }
    }
  }

  return { paletteArray, mode };
}