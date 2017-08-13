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
