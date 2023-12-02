# cpt2js

[![](https://img.shields.io/npm/dm/cpt2js)](https://www.npmjs.com/package/cpt2js)
[![](https://img.shields.io/david/weatherlayers/cpt2js)](https://www.npmjs.com/package/cpt2js)
[![](https://img.shields.io/bundlephobia/min/cpt2js)](https://www.npmjs.com/package/cpt2js)

Color palette text parser to a function, input compatible with [GMT](https://docs.generic-mapping-tools.org/latest/cookbook/features.html#color-palette-tables), [GDAL](https://gdal.org/programs/gdaldem.html#color-relief), [GRASS](https://grass.osgeo.org/grass80/manuals/r.colors.html), [PostGIS](http://postgis.net/docs/RT_ST_ColorMap.html), [ArcGIS](https://desktop.arcgis.com/en/arcmap/latest/manage-data/raster-and-images/creating-a-color-map-clr-file.htm)

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

Color palette references:

- [cpt-city](http://soliton.vm.bytemark.co.uk/pub/cpt-city/) - a large collection of color palette files (use `cpt` or `pg` formats)
- [cpt-city format notes](http://soliton.vm.bytemark.co.uk/pub/cpt-city/notes/formats.html)
- [cpt-city software notes](http://soliton.vm.bytemark.co.uk/pub/cpt-city/notes/software.html)

## Install

```
npm install cpt2js
```

or

```
<script src="https://unpkg.com/cpt2js@1.5.2/dist/cpt2js.umd.min.js"></script>
```

## Usage

The library exposes a function `parsePalette`, which can be used to parse the color palette text or array.

Formats:

- text (`string`) - see [Text format](#text-format) for details
- array (`[string | number, PaletteColor][]`) - `PaletteColor` is any object accepted by [Chroma.js constructor](https://vis4.net/chromajs/#chroma)

The second argument of `parsePalette` is an options object:

- bounds (`[number, number]`) - used for resolving relative values to absolute values, default `[0, 1]`

The parse result is a [Chroma.js Scale](https://vis4.net/chromajs/#chroma-scale), a function `(value: number) => Color`.

The colors returned are [Chroma.js Color](https://vis4.net/chromajs/#color) objects, with default `toString` method returning a hex color.

### From text

```
import { parsePalette } from 'cpt2js';

const palette = `
0   black
1   white
`;
const paletteScale = parsePalette(palette);

paletteScale(0.5).toString(); // '#808080'
paletteScale(0.5).css(); // 'rgb(128, 128, 128)' - use for CSS
paletteScale(0.5).rgba(); // [128, 128, 128, 1] - use for deck.gl, multiply alpha by 255
```

### From text - Relative values

```
import { parsePalette } from 'cpt2js';

const palette = `
0%   black
100% white
`;
const paletteScale = parsePalette(palette, { bounds: [0, 100] });

paletteScale(50).toString(); // '#808080'
```

### From array

```
import { parsePalette } from 'cpt2js';

const palette = [
  [0, 'black'],
  [1, 'white'],
];
const paletteScale = parsePalette(palette);

paletteScale(0.5).toString(); // '#808080'
paletteScale(0.5).css(); // 'rgb(128, 128, 128)' - use for CSS
paletteScale(0.5).rgba(); // [128, 128, 128, 1] - use for deck.gl, multiply alpha by 255
```

### From array - Relative values

```
import { parsePalette } from 'cpt2js';

const palette = [
  ['0%',   'black'],
  ['100%', 'white'],
];
const paletteScale = parsePalette(palette, { bounds: [0, 100] });

paletteScale(50).toString(); // '#808080'
```

### Color ramp

The library exposes a function `colorRampCanvas`, which can be used to color ramp the scale function to a canvas. The canvas can be encoded to a Data URL and rendered as an image.

The second argument of `colorRampCanvas` is an options object:

- width (`number`) - width of the canvas, used also as a number of color ramp colors, default `256`
- height (`number`) - height of the canvas, default `1`

```
import { parsePalette, colorRampCanvas } from 'cpt2js';

const palette = `
0   black
1   white
`;
const paletteScale = parsePalette(palette);
const paletteCanvas = colorRampCanvas(scale);
const paletteCanvasDataUrl = paletteCanvas.toDataURL();
const html = `<img src="${paletteCanvasDataUrl}">`;
```

## Text format

### Formats

<table>

<tr>
<th>
GMT4
</th>
<td>

```
0   0   0   0   1   255 255 255
```

</td>
</tr>

<tr>
<th>
GMT5
</th>
<td>

```
0   0/0/0   1   255/255/255
```

</td>
</tr>

<tr>
<th>
GDAL, GRASS, PostGIS, ArcGIS
</th>
<td>

```
0   0   0   0
1   255 255 255
```

</td>
</tr>

</table>

### Values

<table>

<tr>
<th>
Absolute
</th>
<td>

```
0   black
```

</td>
</tr>

<tr>
<th>
Relative
</th>
<td>

```
0%  black
```

</td>
</tr>

<tr>
<th>
Nodata
</th>
<td>

```
N      gray
nv     gray
null   gray
nodata gray
```

</td>
</tr>

</table>

### Colors

<table>

<tr>
<th>
Named
</th>
<td>

```
0   black
1   white
```

</td>
</tr>

<tr>
<th>
Hex
</th>
<td>

```
0   #000000
1   #ffffff
```

</td>
</tr>

<tr>
<th>
RGB
</th>
<td>

```
0   0   0   0
1   255 255 255
```

</td>
</tr>

<tr>
<th>
Alpha
</th>
<td>

```
0   0   0   0   0
1   255 255 255 255
```

</td>
</tr>

<tr>
<th>
HSL
</th>
<td>

```
# COLOR_MODEL = hsl
0   300 1 0.5
0.5 150 1 0.5
1   0   1 0.5
```

</td>
</tr>

<tr>
<th>
HSV
</th>
<td>

```
# COLOR_MODEL = hsv
0   300 1 1
0.5 150 1 1
1   0   1 1
```

</td>
</tr>

</table>

## Thanks

Discussion at [stac-extensions/raster#17](https://github.com/stac-extensions/raster/issues/17) and [Cloud-Native Geospatial Outreach Event 2022](https://www.ogc.org/ogcevents/cloud-native-geospatial-outreach-event) that sparked the idea for the library.