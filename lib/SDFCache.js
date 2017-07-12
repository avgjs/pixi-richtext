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

const DISPOSEDCACHE = [];

const LRUMAXITEMCOUNT = 50;

const UVVERTEXCACHE = LRU({
  max: LRUMAXITEMCOUNT,
  dispose: (key, value) => {
    DISPOSEDCACHE.push([ value.x, value.y ]);
    // console.log(`SDF 缓存：'${key}' 被释放`);
  }
});


let currentX = 0;
let currentY = 0;

export function getTextData(text) {

  if (text.length > LRUMAXITEMCOUNT) {
    console.warn(`[RichText] The number of characters to be rendered in one time exceeds the number in the cache, and the text rendering will appear with an error. To resolve it, you should enlarge the cache or divide the text to two part at least.`);
  }

  const retData = [];
  let sdfTextureNeedUpdate = false;

  for (const char of text) {
    let uvVertex = UVVERTEXCACHE.get(char);

    if (!uvVertex) {

      const sdfPixelData = SDF.renderToImageData(char);

      const [realW, realH] = SDF.measureCharacter(char);
      const ratio = realW / realH;

      const disposedPosition = DISPOSEDCACHE.shift();

      let dx, dy;
      if (disposedPosition) {
        [dx, dy] = disposedPosition;
      } else {
        dx = currentX;
        dy = currentY;

        currentX += SDFSIZEWITHBUFFER;
        if (currentX > TEXTURESIZE - SDFSIZEWITHBUFFER) {
          currentX = 0;
          currentY += SDFSIZEWITHBUFFER;
        }
        if (currentY > TEXTURESIZE - SDFSIZEWITHBUFFER) {
          console.error('cache texture size overflow!');
        }
      }

      const x0 = dx / TEXTURESIZE;
      const y0 = dy / TEXTURESIZE;

      const x1 = (dx + SDFSIZEWITHBUFFER * ratio) / TEXTURESIZE;
      const y1 = y0;

      const x2 = x1;
      const y2 = (dy + SDFSIZEWITHBUFFER) / TEXTURESIZE;

      const x3 = x0;
      const y3 = y2;

      const uv0 = (((y0 * 65535) & 0xFFFF) << 16) | ((x0 * 65535) & 0xFFFF);
      const uv1 = (((y1 * 65535) & 0xFFFF) << 16) | ((x1 * 65535) & 0xFFFF);
      const uv2 = (((y2 * 65535) & 0xFFFF) << 16) | ((x2 * 65535) & 0xFFFF);
      const uv3 = (((y3 * 65535) & 0xFFFF) << 16) | ((x3 * 65535) & 0xFFFF);

      uvVertex = {
        char,
        uvs: new Uint32Array([uv0, uv1, uv2, uv3]),
        realWidth: realW,
        realHeight: realH,
        x: dx,
        y: dy
      };
      // [uv0, uv1, uv2, uv3, realW, realH, dx, dy];

      UVVERTEXCACHE.set(char, uvVertex);
      sdfTextureNeedUpdate = true;

      CONTEXT.putImageData(sdfPixelData, dx, dy);

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
    sizeWithBuffer: SDFSIZEWITHBUFFER,
    textureSize: TEXTURESIZE
  };
}
