
/*
 * Copyright (c) 2022 WeatherLayers.com
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import type { Scale } from 'chroma-js';

export interface ColorRampCanvasOptions {
  width?: number;
  height?: number;
}

export function colorRampCanvas(scale: Scale, { width = 256, height = 1 }: ColorRampCanvasOptions = {}): HTMLCanvasElement {
  const colors = scale.colors(width, 'css' as any) as string[];

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.style.imageRendering = '-moz-crisp-edges';
  canvas.style.imageRendering = 'pixelated';
  
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  for (let i = 0; i < width; i++) {
    ctx.fillStyle = colors[i];
    ctx.fillRect(i, 0, 1, height);
  }

  return canvas;
}