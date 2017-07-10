import { getSDFTexture, getTextData, getSDFConfig } from './SDFCache';

const sdfConfig = getSDFConfig();

class Character {
  constructor(char, uvs, vertexData) {
    this.bold = false;
    this.italic = false;
    this.underline = false;
    this.strike = false;

    this.size = 24;
    // this.font
    this.fill = true;
    this.fillColor = [0, 0, 0, 0];
    this.stroke = false;
    this.strokeColor = [1, 1, 1, 1];
    this.shadow = false;
    this.shadowColor = [0, 0, 0, 0];
    this.shadowBlur = 0;
    this.shadowOffset = [0, 0];

    this.uvs = uvs;
    this.vertexData = vertexData;

    this.char = char;

    //
    // this.worldAlpha = 
  }
}

export function parseRichText(text, sprite) {
  const vertexList = [];
  const style = sprite.style;

  const now = performance.now();

  const uvVertexList = getTextData(text);

  console.log(`SDF 纹理生成/获得时间：${(performance.now() - now) << 0} ms`)

  let x = 0;
  let y = 0;

  for (const {uvs, realWidth: width, realHeight: height} of uvVertexList) {
    const ratio = width / height;
    const ratio2 = sdfConfig.size / style.fontSize;
    const vertexData = calculateVertices(x, y, width, height, style.fontSize, sprite.transform.worldTransform, sprite._anchor);

    x += width - sdfConfig.buffer * 2;
    y += 0;

    const shadowRGB = 0xff0000;
    const strokeRGB = 0xffffff;
    const fillRGB = 0x000000;
    const shadowAlpha = 1;
    const strokeAlpha = 1;
    const fillAlpha = 1;

    // const character = new Character();

    const character = {
      worldAlpha: sprite.worldAlpha,
      tintRGB: sprite._tintRGB,
      shadowEnable: style.dropShadow,
      strokeEnable: +(!!style.strokeThickness),
      fillEnable: 1,
      shadowOffset: [Math.cos(style.dropShadowAngle) * style.dropShadowDistance * ratio2 / sdfConfig.textureSize, Math.sin(style.dropShadowAngle) * style.dropShadowDistance * ratio2 / sdfConfig.textureSize],
      shadow: Math.max(0, style.strokeThickness * -0.06 + 0.7),
      shadowBlur: 0.15,
      stroke: Math.max(0, style.strokeThickness * -0.06 + 0.7),
      fill: 0.75 - (+(!style.strokeThickness)) * 0.02,
      gamma: 2 * 1.4142 / (style.fontSize * 1.8),
      shadowColor: (shadowRGB >> 16) + (shadowRGB & 0xff00) + ((shadowRGB & 0xff) << 16) + (Math.min(shadowAlpha, 1) * 255 << 24),
      strokeColor: (strokeRGB >> 16) + (strokeRGB & 0xff00) + ((strokeRGB & 0xff) << 16) + (Math.min(strokeAlpha, 1) * 255 << 24),
      fillColor: (fillRGB >> 16) + (fillRGB & 0xff00) + ((fillRGB & 0xff) << 16) + (Math.min(fillAlpha, 1) * 255 << 24),
      // textureId: this._texture.baseTexture._virtalBoundId,
      baseTexture: getSDFTexture(),
      blendMode: sprite.blendMode,
      uvs,
      vertexData
    };

    vertexList.push(character);
  }

  return vertexList;
}

/**
 * calculates worldTransform * vertices, store it in vertexData
 */
function calculateVertices(x, y, width, height, fontSize, worldTransform, anchor) {
  // if (this._transformID === this.transform._worldID && this._textureID === this._texture._updateID) {
  //   return;
  // }
  // this._transformID = this.transform._worldID;
  // this._textureID = this._texture._updateID;
  // set the vertex data
  // const texture = this._texture;
  const wt = worldTransform;
  const a = wt.a;
  const b = wt.b = 0;
  const c = wt.c = 0; //Math.sin(-0.207);
  const d = wt.d;
  const tx = wt.tx;
  const ty = wt.ty;
  // const anchor = this._anchor;
  let w0 = 0;
  let w1 = 0;
  let h0 = 0;
  let h1 = 0;


  // w1 = -anchor._x * orig.width;
  // w0 = w1 + orig.width;
  // h1 = -anchor._y * orig.height;
  // h0 = h1 + orig.height;

  const ratio = 1 / (sdfConfig.size / fontSize);

  w1 = (x - anchor._x * width) * ratio;
  w0 = w1 + width * ratio;
  h1 = (y - anchor._y * height) * ratio;
  h0 = h1 + height * ratio;

  const vertexData = [];
  // xy
  vertexData[0] = (a * w1) + (c * h1) + tx;
  vertexData[1] = (d * h1) + (b * w1) + ty;
  // xy
  vertexData[2] = (a * w0) + (c * h1) + tx;
  vertexData[3] = (d * h1) + (b * w0) + ty;
  // xy
  vertexData[4] = (a * w0) + (c * h0) + tx;
  vertexData[5] = (d * h0) + (b * w0) + ty;
  // xy
  vertexData[6] = (a * w1) + (c * h0) + tx;
  vertexData[7] = (d * h0) + (b * w1) + ty;

  return vertexData;
}
