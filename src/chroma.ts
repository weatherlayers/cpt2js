/*
 * Copyright (c) 2022 WeatherLayers.com
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
// custom lightweight Chroma.js bundle
// see https://github.com/gka/chroma.js/blob/main/index.js
import chroma from 'chroma-js/src/chroma';

// io --> convert colors
import 'chroma-js/src/io/css';
import 'chroma-js/src/io/hex';
import 'chroma-js/src/io/hsl';
import 'chroma-js/src/io/hsv';
import 'chroma-js/src/io/named';
import 'chroma-js/src/io/rgb';

// operators --> modify existing Colors
import 'chroma-js/src/ops/alpha';

// interpolators
import 'chroma-js/src/interpolator/hsl';
import 'chroma-js/src/interpolator/hsv';
import 'chroma-js/src/interpolator/rgb';

// generators -- > create new colors
import mix from 'chroma-js/src/generator/mix';
import scale from 'chroma-js/src/generator/scale';
(chroma as any).mix = (chroma as any).interpolate = mix;
(chroma as any).scale = scale;

export default chroma;