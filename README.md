# cpt2js

[![](https://img.shields.io/npm/dm/cpt2js)](https://www.npmjs.com/package/cpt2js)
[![](https://img.shields.io/david/weatherlayers/cpt2js)](https://www.npmjs.com/package/cpt2js)
[![](https://img.shields.io/bundlephobia/min/cpt2js)](https://www.npmjs.com/package/cpt2js)

Color palette file parser to a function, input compatible with [GDAL](https://gdal.org/programs/gdaldem.html#color-relief), [GRASS](https://grass.osgeo.org/grass80/manuals/r.colors.html), [GMT](https://docs.generic-mapping-tools.org/latest/cookbook/features.html#color-palette-tables), [ArcGIS](https://desktop.arcgis.com/en/arcmap/latest/manage-data/raster-and-images/creating-a-color-map-clr-file.htm)

[Demo](https://weatherlayers.github.io/cpt2js/)

From [GDAL docs](https://gdal.org/programs/gdaldem.html#color-relief):

> The text-based color configuration file generally contains 4 columns per line: the elevation value and the corresponding Red, Green, Blue component (between 0 and 255). The elevation value can be any floating point value, or the nv keyword for the nodata value. The elevation can also be expressed as a percentage: 0% being the minimum value found in the raster, 100% the maximum value.
>
> An extra column can be optionally added for the alpha component. If it is not specified, full opacity (255) is assumed.
>
> Various field separators are accepted: comma, tabulation, spaces, ‘:’.
>
> Common colors used by GRASS can also be specified by using their name, instead of the RGB triplet. The supported list is: white, black, red, green, blue, yellow, magenta, cyan, aqua, grey/gray, orange, brown, purple/violet and indigo.
>
> GMT .cpt palette files are also supported (COLOR_MODEL = RGB only).
>
> Note: the syntax of the color configuration file is derived from the one supported by GRASS r.colors utility. ESRI HDR color table files (.clr) also match that syntax. The alpha component and the support of tab and comma as separators are GDAL specific extensions.

Differences from GDAL:

- [GMT color formats](https://docs.generic-mapping-tools.org/latest/gmtcolors.html)
- [Chroma.js color formats](https://vis4.net/chromajs/#chroma)
- [Chroma.js color modes](https://vis4.net/chromajs/#scale-mode)

Supported color formats and modes:

- color formats - named, hex, CSS, RGB, HSL, HSV
- color modes - RGB, HSL, HSV
- more color formats and modes can be added as needed

Color palette files can be generated with [GMT makecpt](https://docs.generic-mapping-tools.org/latest/makecpt.html).

## Install

```
npm install cpt2js
```

or

```
<script src="https://unpkg.com/cpt2js@1.1.0/dist/cpt2js.umd.min.js"></script>
```

## Usage

### From text

The library exposes a function `parseCptText`, which can be used to parse the color palette file content.

The second argument of `parseCptText` is an options object:

- bounds `[number, number]` - used only for resolving relative values to absolute values, default `[0, 1]`

The parse result is a [Chroma.js Scale](https://vis4.net/chromajs/#chroma-scale), a function `(value: number) => Color`.

The colors returned are [Chroma.js Color](https://vis4.net/chromajs/#color) objects, with default `toString` method returning a hex color.

```
import { parseCptText } from 'cpt2js';

const cptText = `
0   black
1   white
`;
const scale = parseCptText(cptText);

scale(0.5).toString(); // '#808080'
scale(0.5).css(); // 'rgb(128, 128, 128)' - use for CSS
scale(0.5).rgba(); // [128, 128, 128, 1] - use for deck.gl, multiply alpha by 255
```

### From text - Relative values

```
import { parseCptText } from 'cpt2js';

const cptText = `
0%   black
100% white
`;
const scale = parseCptText(cptText, [0, 100]);

scale(50).toString(); // '#808080'
```

### From array

The library exposes a function `parseCptArray`, which can be used to parse the color palette array `[number, Color][]`.

The parse result is a [Chroma.js Scale](https://vis4.net/chromajs/#chroma-scale), a function `(value: number) => Color`.

The colors returned are [Chroma.js Color](https://vis4.net/chromajs/#color) objects, with default `toString` method returning a hex color.

```
import { parseCptArray } from 'cpt2js';

const cptArray = [
  [0, 'black'],
  [1, 'white'],
];
const scale = parseCptArray(cptArray);

scale(0.5).toString(); // '#808080'
```

### Color ramp

The library exposes a function `colorRampCanvas`, which can be used to color ramp the scale function to a canvas. The canvas can be encoded to a Data URL and rendered as an image.

The second argument of `colorRampCanvas` is an options object:

- width `number` - width of the canvas, used also as a number of color ramp colors, default `256`
- height `number` - height of the canvas, default `1`

```
import { parseCptText, colorRampCanvas } from 'cpt2js';

const cptText = `
0   black
1   white
`;
const scale = parseCptText(cptText);
const canvas = colorRampCanvas(scale);
const canvasDataUrl = canvas.toDataURL();
const html = `<img src="${canvasDataUrl}">`;
```

## Supported color palettes

### Named colors

```
0   black
1   white
```

### Hex colors

```
0   #000000
1   #ffffff
```

### RGB colors

```
0   0   0   0
1   255 255 255
```

### HSL colors

```
# COLOR_MODEL = hsl
0   300 1 0.5
0.5 150 1 0.5
1   0   1 0.5
```

### HSV colors

```
# COLOR_MODEL = hsv
0   300 1 1
0.5 150 1 1
1   0   1 1
```

### Nodata color

```
0   black
1   white
nv  gray
```