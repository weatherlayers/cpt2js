/*
 * Copyright (c) 2022 WeatherLayers.com
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as fs from 'fs';
import { parseCptTextInternal } from './parse-text';

const PATH = __dirname + '/../fixtures';
const FILENAMES = fs.readdirSync(PATH).filter(x => x.endsWith('.cpt'));

describe('parseCptTextInternal', () => {
  it.each(FILENAMES)('returns a color palette', (filename) => {
    const text = fs.readFileSync(PATH + '/' + filename).toString();
    const actual = parseCptTextInternal(text);
    // fs.writeFileSync(PATH + '/' + filename.replace('.cpt', '.json'), JSON.stringify(actual));

    const expected = JSON.parse(fs.readFileSync(PATH + '/' + filename.replace('.cpt', '.json')).toString());

    expect(actual).toEqual(expected);
  });
});