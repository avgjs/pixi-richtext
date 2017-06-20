import LRU from 'lru-cache';
import TinySDF from './SDF';

const TEXTURESIZE = 2048;

const CANVAS = document.createElement('canvas');
CANVAS.width = CANVAS.height = TEXTURESIZE;
const CONTEXT = CANVAS.getContext('2d');

document.body.appendChild(CANVAS)
window.CANVAS = CANVAS;

const SDFSIZE = 54;
const SDFBUFFER = 5;
const SDFSIZEWITHBUFFER = SDFSIZE + SDFBUFFER * 2;

const SDF = new TinySDF(SDFSIZE, SDFBUFFER, SDFSIZE / 3);

let SDFTEXTURE = PIXI.BaseTexture.fromCanvas(CANVAS);
SDFTEXTURE.mipmap = false;
const UVVERTEXCACHE = LRU({
  max: 500,
  dispose: (key, value) => console.log(`SDF 缓存：'${key}' 被释放`)
});


let currentX = 0;
let currentY = 0;

export function getTextData(text) {
  const retData = [];
  let sdfTextureNeedUpdate = false;

  for (const char of text) {
    let uvVertex = UVVERTEXCACHE.get(char);

    if (!uvVertex) {

      const sdfPixelData = SDF.renderToImageData(char);

      const [realW, realH] = SDF.measureCharacter(char);
      const ratio = realW / realH;

      const x0 = currentX / TEXTURESIZE;
      const y0 = currentY / TEXTURESIZE;

      const x1 = (currentX + SDFSIZEWITHBUFFER * ratio) / TEXTURESIZE;
      const y1 = y0;

      const x2 = x1;
      const y2 = (currentY + SDFSIZEWITHBUFFER) / TEXTURESIZE;

      const x3 = x0;
      const y3 = y2;

      const uv0 = (((y0 * 65535) & 0xFFFF) << 16) | ((x0 * 65535) & 0xFFFF);
      const uv1 = (((y1 * 65535) & 0xFFFF) << 16) | ((x1 * 65535) & 0xFFFF);
      const uv2 = (((y2 * 65535) & 0xFFFF) << 16) | ((x2 * 65535) & 0xFFFF);
      const uv3 = (((y3 * 65535) & 0xFFFF) << 16) | ((x3 * 65535) & 0xFFFF);

      uvVertex = [uv0, uv1, uv2, uv3, ...SDF.measureCharacter(char)];

      UVVERTEXCACHE.set(char, uvVertex);
      sdfTextureNeedUpdate = true;

      CONTEXT.putImageData(sdfPixelData, currentX, currentY);

      currentX += SDFSIZEWITHBUFFER;
      if (currentX > TEXTURESIZE - SDFSIZEWITHBUFFER) {
        currentX = 0;
        currentY += SDFSIZEWITHBUFFER;
      }
      if (currentY > TEXTURESIZE - SDFSIZEWITHBUFFER) {
        console.error('cache texture size overflow!');
      }
    }

    retData.push(uvVertex);
  }

  if (sdfTextureNeedUpdate) {
    SDFTEXTURE.update();
  }

  return retData;
}

export function getSDFTexture() {
  return SDFTEXTURE;
}

export function getSDFConfig() {
  return {
    size: SDFSIZE,
    buffer: SDFBUFFER,
    sizeWithBuffer: SDFSIZEWITHBUFFER
  };
}
