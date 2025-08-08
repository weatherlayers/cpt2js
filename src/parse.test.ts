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
import { parsePalette } from './parse.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const PATH = path.join(__dirname, '../fixtures');
const FILENAMES = fs.readdirSync(PATH).filter(x => x.endsWith('.cpt'));

describe('parsePalette', () => {
  test('returns a color palette from a text', () => {
    for (const filename of FILENAMES) {
      const cptPath = path.join(PATH, filename);

      const cptText = fs.readFileSync(cptPath).toString();
      const actual = parsePalette(cptText);

      assert(actual);

      const color = actual(0).rgb();
      assert(isFinite(color[0]));
      assert(isFinite(color[1]));
      assert(isFinite(color[2]));
    }
  });

  test('returns a color palette from an array', () => {
    for (const filename of FILENAMES) {
      const jsonPath = path.join(PATH, filename.replace('.cpt', '.json'));

      const cptArray = JSON.parse(fs.readFileSync(jsonPath).toString()).paletteArray;
      const actual = parsePalette(cptArray);

      assert(actual);

      const color = actual(0).rgb();
      assert(isFinite(color[0]));
      assert(isFinite(color[1]));
      assert(isFinite(color[2]));
    }
  });
});