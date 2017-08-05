import huozi from 'huozi';

import { getSDFTexture, getTextData, getSDFConfig } from './SDFCache';
import parser from './parser/dsl.pegjs';
import dfs from './dfs';

const sdfConfig = getSDFConfig();

export function parseRichText(text, sprite) {

  var now = performance.now();
  const ast = parser.parse(text);
  process.env.NODE_ENV !== 'production' && console.log(`富文本解析时间：${(performance.now() - now) << 0} ms`)

  let plainText = '';

  for (const [node] of dfs(ast)) {
    (node.nodeType === 'text') && (plainText += node.content);
  }

  var now = performance.now();
  const uvVertexList = getTextData(plainText);
  process.env.NODE_ENV !== 'production' && console.log(`SDF 纹理生成/获得时间：${(performance.now() - now) << 0} ms`)

  const vertexList = [];
  let currentStyle = sprite.style.clone();
  const styleStack = [];
  let lastDepth = 0;

  let index = 0;
  let x = 0;
  let y = 0;

  var now = performance.now();
  for (const [node, depth] of dfs(ast)) {
    if (depth - lastDepth < 0) {
      for (let i = lastDepth - depth; i > 0; i--) {
        currentStyle = styleStack.pop();
      }
    }

    lastDepth = depth;

    if (node.nodeType === 'text') {
      const start = index;
      const end = index += node.content.length;

      const currentState = currentStyle.state;
      for (let i = start; i < end; i++) {
        vertexList.push({
          ...currentState,
          ...uvVertexList[i],
          worldAlpha: sprite.worldAlpha,
          tintRGB: sprite._tintRGB,
          blendMode: sprite.blendMode
        });
      }
    } else {
      styleStack.push(currentStyle);
      currentStyle = currentStyle.clone();

      if (Object.keys(currentStyle).includes(node.tagName) && !['fontFamily'].includes(node.tagName)) {
        currentStyle[node.tagName] = (node.value === undefined) ? true : node.value;
      }
    }
  }
  process.env.NODE_ENV !== 'production' && console.log(`树形到一维数组时间：${(performance.now() - now) << 0} ms`)

  var now = performance.now();
  const list = huozi(vertexList, {
    ...sprite.style.layout,
    fixLeftQuote: false
  });
  process.env.NODE_ENV !== 'production' && console.log(`排版时间：${(performance.now() - now) << 0} ms`)

  return list;
}

/**
 * calculates worldTransform * vertices, store it in vertexData
 */
function calculateVertices(x, y, width, height, sprite, italic = false) {
  // if (this._transformID === this.transform._worldID && this._textureID === this._texture._updateID) {
  //   return;
  // }
  // this._transformID = this.transform._worldID;
  // this._textureID = this._texture._updateID;
  // set the vertex data
  // const texture = this._texture;

  const worldTransform = sprite.transform.worldTransform;
  const anchor = sprite._anchor;

  const { x: dx, y: dy } = sprite;

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

  // const ratio = fontSize / sdfConfig.size;

  w1 = (x + dx - anchor._x * width);
  w0 = w1 + width;
  h1 = (y + dy - anchor._y * height);
  h0 = h1 + height;

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
