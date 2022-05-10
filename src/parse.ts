/*
 * Copyright (c) 2022 WeatherLayers.com
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import chroma from './chroma';
import { parsePaletteTextInternal } from './parse-text';

import type { InterpolationMode, Scale } from 'chroma-js';
import type { PaletteColor, PaletteEntry, PaletteArray } from './parse-text';

export { Scale, PaletteColor, PaletteEntry, PaletteArray };
export type Palette = string | PaletteArray;

export interface ParseOptions {
  bounds?: [number, number];
}

const DEFAULT_MODE: InterpolationMode = 'rgb';

function parseValue(value: string | number, bounds: [number, number]): number | null | undefined {
  if (typeof value === 'string') {
    if (value[value.length - 1] === '%') {
      const percentage = parseFloat(value) / 100;
      if (percentage < 0 || percentage > 1) {
        throw new Error(`Invalid value for a percentage ${value}`);
      }
      return bounds[0] + (bounds[1] - bounds[0]) * percentage;
    } else if (value === 'N') {
      return null; // GMT nodata
    } else if (value === 'B') {
      return undefined; // GMT background (value < min), not supported yet, ignore
    } else if (value === 'F') {
      return undefined; // GMT foreground (value > max), not supported yet, ignore
    } else if (value === 'nv') {
      return null; // GDAL nodata
    } else if (value === 'default') {
      return undefined; // GRASS default (value < min || value > max), not supported yet, ignore
    } else if (value === 'null') {
      return null; // PostGIS nodata
    } else if (value === 'nodata') {
      return null; // PostGIS nodata
    } else {
      return parseFloat(value);
    }
  } else if (typeof value === 'number') {
    return value;
  } else {
    throw new Error('Invalid state');
  }
}

function parseColor(color: PaletteColor, mode: InterpolationMode): object | string {
  if (Array.isArray(color)) {
    if (color.length === 4) {
      // color with alpha
      return {
        [mode[0]]: parseFloat(color[0].toString()),
        [mode[1]]: parseFloat(color[1].toString()),
        [mode[2]]: parseFloat(color[2].toString()),
        a: parseFloat(color[3].toString()) / 255,
      };
    } else if (color.length === 3) {
      // color
      return {
        [mode[0]]: parseFloat(color[0].toString()),
        [mode[1]]: parseFloat(color[1].toString()),
        [mode[2]]: parseFloat(color[2].toString()),
      };
    } else {
      throw new Error(`Invalid color ${color}`);
    }
  } else if (typeof color === 'string' || typeof color === 'number') {
    if (color.toString().match(/\d+/) || typeof color === 'number') {
      // grayscale color
      return {
        [mode[0]]: parseFloat(color.toString()),
        [mode[1]]: parseFloat(color.toString()),
        [mode[2]]: parseFloat(color.toString()),
      };
    } else {
      // color name
      return color;
    }
  } else {
    throw new Error(`Invalid color ${color}`);
  }
}

function parsePaletteArray(paletteArray: PaletteArray, { bounds = [0, 1], mode = DEFAULT_MODE }: ParseOptions & { mode?: InterpolationMode } = {}): Scale {
  const colors: (object | string)[] = [];
  const domain: number[] = [];
  let nodata;
  for (let [value, color] of paletteArray) {
    const parsedValue = parseValue(value, bounds);
    const parsedColor = parseColor(color, mode);

    if (parsedValue != null) {
      colors.push(parsedColor);
      domain.push(parsedValue);
    } else if (parsedValue === null) {
      nodata = parsedColor;
    } else {
      // ignore
    }
  }

  let palette = chroma.scale(colors as any).domain(domain).mode(mode);
  if (typeof nodata !== 'undefined') {
    palette = (palette as any).nodata(nodata);
  }
  return palette;
}

function parsePaletteText(paletteText: string, { bounds = [0, 1] }: ParseOptions = {}): Scale {
  const { paletteArray, mode } = parsePaletteTextInternal(paletteText);
  return parsePaletteArray(paletteArray, { bounds, mode });
}

export function parsePalette(palette: Palette, { bounds = [0, 1] }: ParseOptions = {}): Scale {
  if (typeof palette === 'string') {
    return parsePaletteText(palette, { bounds });
  } else if (Array.isArray(palette)) {
    return parsePaletteArray(palette, { bounds });
  } else {
    throw new Error('Invalid format');
  }
}