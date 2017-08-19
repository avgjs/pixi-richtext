import huozi from 'huozi';

import { getSDFTexture, getUVVertex, autoUpdateTexture, getSDFConfig } from './SDFCache';
import parser from './parser/dsl.pegjs';
import dfs from './dfs';

const sdfConfig = getSDFConfig();

const NODE_ENV = process.env.NODE_ENV;

export function parseRichText(text, sprite) {

  var now = performance.now();
  const ast = parser.parse(text);
  NODE_ENV !== 'production' && console.log(`富文本解析时间：${(performance.now() - now) << 0} ms`)

  // let plainText = '';

  // for (const [node] of dfs(ast)) {
  //   (node.nodeType === 'text') && (plainText += node.content);
  // }

  // var now = performance.now();
  // const uvVertexList = getTextData(plainText);
  // NODE_ENV !== 'production' && console.log(`SDF 纹理生成/获得时间：${(performance.now() - now) << 0} ms`)

  const vertexList = [];
  let currentStyle = sprite.style.clone();
  const styleStack = [];
  let lastDepth = 0;

  // let index = 0;
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
      const content = node.content;
      const end = content.length;

      const currentState = currentStyle.state;
      for (let i = 0; i < end; i++) {
        vertexList.push({
          ...currentState,
          ...getUVVertex(content[i], currentState.fontFamily),
          worldAlpha: sprite.worldAlpha,
          tintRGB: sprite._tintRGB,
          blendMode: sprite.blendMode
        });
      }
    } else {
      styleStack.push(currentStyle);
      currentStyle = currentStyle.clone();

      if (Object.keys(currentStyle).includes(node.tagName)) {
        currentStyle[node.tagName] = (node.value === undefined) ? true : node.value;
      }
    }
  }
  autoUpdateTexture();
  NODE_ENV !== 'production' && console.log(`树形到一维数组+纹理生成时间：${(performance.now() - now) << 0} ms`)


  var now = performance.now();
  const list = huozi(vertexList, {
    ...sprite.style.layout,
    fixLeftQuote: false
  });
  NODE_ENV !== 'production' && console.log(`排版时间：${(performance.now() - now) << 0} ms`)

  return list;
}
