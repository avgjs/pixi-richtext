import { getSDFTexture, getTextData, getSDFConfig } from './SDFCache';

const sdfConfig = getSDFConfig();

export function parseRichText(text, sprite) {
  const vertexList = [];
  const style = sprite.style;

  const now = performance.now();

  const uvVertexList = getTextData(text);

  console.log(`SDF 纹理生成/获得时间：${(performance.now() - now) << 0} ms`)

  const character = style.state;

  let x = 0;
  let y = 0;

  for (const {uvs, realWidth: width, realHeight: height} of uvVertexList) {
    const vertexData = calculateVertices(x, y, width, height, style.fontSize, sprite.transform.worldTransform, sprite._anchor);
    x += width - sdfConfig.buffer * 2;
    y += 0;

    vertexList.push({
      ...character,
      worldAlpha: sprite.worldAlpha,
      tintRGB: sprite._tintRGB,
      blendMode: sprite.blendMode,
      uvs,
      vertexData
    });
  }

  return vertexList;
}

/**
 * calculates worldTransform * vertices, store it in vertexData
 */
function calculateVertices(x, y, width, height, fontSize, worldTransform, anchor, italic = false) {
  // if (this._transformID === this.transform._worldID && this._textureID === this._texture._updateID) {
  //   return;
  // }
  // this._transformID = this.transform._worldID;
  // this._textureID = this._texture._updateID;
  // set the vertex data
  // const texture = this._texture;
  const wt = worldTransform;
  const a = wt.a;
  const b = wt.b;
  const c = wt.c = italic ? Math.sin(-0.207) : 0;
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
