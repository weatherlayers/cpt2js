/*
 * Copyright (c) 2022 WeatherLayers.com
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import fs from 'fs';
import { parseCpt } from './parse';

const PATH = __dirname + '/../fixtures';
const FILENAMES = fs.readdirSync(PATH).filter(x => x.endsWith('.cpt'));

describe('parseCpt', () => {
  it.each(FILENAMES)('returns a color palette from a text', (filename) => {
    const cptText = fs.readFileSync(PATH + '/' + filename).toString();
    const actual = parseCpt(cptText);

    expect(actual).toBeDefined();
  });

  it.each(FILENAMES)('returns a color palette from an array', (filename) => {
    const cptArray = fs.readFileSync(PATH + '/' + filename.replace('.cpt', '.json')).toString();
    const actual = parseCpt(cptArray);

    expect(actual).toBeDefined();
  });
});