/*
 * Copyright (c) 2022 WeatherLayers.com
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import fs from 'fs';
import { parseCptText } from './parse';

const PATH = __dirname + '/../fixtures';
const FILENAMES = fs.readdirSync(PATH).filter(x => x.endsWith('.cpt'));

const BOUNDS = [0, 3500];

describe('parseCptText', () => {
  it.each(FILENAMES)('returns a color scale', (filename) => {
    const text = fs.readFileSync(PATH + '/' + filename).toString();
    const scale = parseCptText(text, { bounds: BOUNDS });
    const domain = scale.domain();
    const actual = new Array(11).fill(undefined).map((_, i) => {
      const value = domain[0] + (domain[1] - domain[0]) * (i / 10);
      return [value, scale(value).rgba()];
    });
    // fs.writeFileSync(PATH + '/' + filename.replace('.cpt', '.json'), JSON.stringify(actual));

    const expected = JSON.parse(fs.readFileSync(PATH + '/' + filename.replace('.cpt', '.json')).toString());

    expect(actual).toEqual(expected);
  });
});