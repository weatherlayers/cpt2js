/*
 * Copyright (c) 2022 WeatherLayers.com
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as fs from 'fs';
import { parsePalette } from './parse';

const PATH = __dirname + '/../fixtures';
const FILENAMES = fs.readdirSync(PATH).filter(x => x.endsWith('.cpt'));

describe('parsePalette', () => {
  it.each(FILENAMES)('returns a color palette from a text', (filename) => {
    const cptText = fs.readFileSync(PATH + '/' + filename).toString();
    const actual = parsePalette(cptText);

    expect(actual).toBeDefined();

    const color = actual(0).rgb();
    expect(isFinite(color[0])).toBeTruthy();
    expect(isFinite(color[1])).toBeTruthy();
    expect(isFinite(color[2])).toBeTruthy();
  });

  it.each(FILENAMES)('returns a color palette from an array', (filename) => {
    const cptArray = JSON.parse(fs.readFileSync(PATH + '/' + filename.replace('.cpt', '.json')).toString()).paletteArray;
    const actual = parsePalette(cptArray);

    expect(actual).toBeDefined();

    const color = actual(0).rgb();
    expect(isFinite(color[0])).toBeTruthy();
    expect(isFinite(color[1])).toBeTruthy();
    expect(isFinite(color[2])).toBeTruthy();
  });
});