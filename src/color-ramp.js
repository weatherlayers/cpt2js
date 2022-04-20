
/*
 * Copyright (c) 2022 WeatherLayers.com
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/** @typedef {import('chroma-js').Scale} Scale */
/** @typedef {{ width?: number, height?: number }} ColorRampCanvasOptions */

/**
 * @param {Scale} scale
 * @param {ColorRampCanvasOptions} [options]
 * @return {HTMLCanvasElement}
 */
export function colorRampCanvas(scale, { width = 256, height = 1 } = {}) {
  const colors = scale.colors(width, 'css');

  const canvas = /** @type CanvasRenderingContext2D */ (document.createElement('canvas'));
  canvas.width = width;
  canvas.height = height;
  canvas.style.imageRendering = '-moz-crisp-edges';
  canvas.style.imageRendering = 'pixelated';
  
  const ctx = canvas.getContext('2d');
  for (let i = 0; i < width; i++) {
    ctx.fillStyle = colors[i];
    ctx.fillRect(i, 0, 1, height);
  }

  return canvas;
}