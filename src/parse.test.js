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

describe('parseCptText', () => {
  it.each(FILENAMES)('returns a color palette', (filename) => {
    const text = fs.readFileSync(PATH + '/' + filename).toString();
    const actual = parseCptText(text);

    expect(actual).toBeDefined();
  });
});