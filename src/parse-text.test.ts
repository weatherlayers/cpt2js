/*
 * Copyright (c) 2022 WeatherLayers.com
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import assert from 'node:assert';
import { describe, test } from 'node:test';
import * as path from 'node:path';
import * as url from 'node:url';
import * as fs from 'fs';
import { parsePaletteTextInternal } from './parse-text.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const PATH = path.join(__dirname, '../fixtures');
const FILENAMES = fs.readdirSync(PATH).filter(x => x.endsWith('.cpt'));

describe('parsePaletteTextInternal', () => {
  test('returns a color palette', () => {
    for (const filename of FILENAMES) {
      const cptPath = path.join(PATH, filename);
      const jsonPath = path.join(PATH, filename.replace('.cpt', '.json'));
      
      const text = fs.readFileSync(cptPath).toString();
      const actual = parsePaletteTextInternal(text);
      // fs.writeFileSync(jsonPath, JSON.stringify(actual));

      const expected = JSON.parse(fs.readFileSync(jsonPath).toString());
      if (!('mode' in expected)) {
        expected.mode = undefined;
      }

      assert.deepStrictEqual(actual, expected);
    }
  });
});