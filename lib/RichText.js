const PIXI = require('pixi.js');
import { parseRichText } from './utils';
import TextStyle from './TextStyle';
import { getSDFConfig } from './SDFCache';

const sdfConfig = getSDFConfig();

export default class RichText extends PIXI.Sprite {
  constructor(text, style = {}) {
    super();

    this._style = new TextStyle(style, style.layout || {});

    this._text = text;

    this._vertexList = [];
    this.needUpdateCharacter = true;
    this.vertexCount = 0;

    /**
     * Control rendering position of text
     * Set the value to `n` means render the text from 0 to n
     * Set `-1` to disable.
     */
    this.renderPosition = -1;

    /**
     * Plugin that is responsible for rendering this element.
     * Allows to customize the rendering process without overriding '_renderWebGL' & '_renderCanvas' methods.
     *
     * @member {string}
     * @default 'sprite'
     */
    this.pluginName = 'richtext';

  }
  set text(value) {
    if (this._text !== value) {
      this._text = value;
      this.needUpdateCharacter = true;
    }
  }
  get text() {
    return this._text;
  }
  get style() {
    return this._style;
  }
  set style(value) {
    this._style = new TextStyle(value, value.layout || {});
    this.needUpdateCharacter = true;
  }
  get layout() {
    return this._style.layout;
  }
  set layout(value) {
    this._style.layout = value;
    this.needUpdateCharacter = true;
  }
  get width() {
    const { gridSize, xInterval, column } = this._style.layout;
    return (gridSize + xInterval) * column - xInterval;
  }
  get height() {
    const { gridSize, yInterval, row } = this._style.layout;
    if (isFinite(row)) {
      return (gridSize + yInterval) * row - yInterval;
    } else {
      const { y } = this._vertexList[this._vertexList.length - 1];
      return y + gridSize;
    }
  }
  get vertexList() {
    if (this.renderPosition < 0) {
      return this._vertexList;
    }
    return this._vertexList.slice(0, this.renderPosition);
  }
  _renderWebGL(renderer) {
    const gl = renderer.gl;
    // gl.getExtension("OES_standard_derivatives");
    // console.log(gl)
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
    gl.enable(gl.BLEND);

    if (this._transformID !== this.transform._worldID) {
      this.needUpdateCharacter = true;
    }

    if (this.needUpdateCharacter) {
      // this.generateCharacterData();
      this._vertexList = parseRichText(this._text, this);
      for (const item of this._vertexList) {
        const { realWidth, realHeight, x, y, fontSize, italic } = item;
        const ratio = fontSize / sdfConfig.size;
        const vertexData = this.calculateVertices(x, y, realWidth * ratio, realHeight * ratio, italic);

        if (vertexData) {
          Object.assign(item, { vertexData });
        }
      }
      this.needUpdateCharacter = false;
    }


    // console.log(this.vertexList)

    renderer.setObjectRenderer(renderer.plugins[this.pluginName]);
    renderer.plugins[this.pluginName].render(this);
  }
  calculateVertices(x, y, width, height, italic = false) {
    if (this._transformID === this.transform._worldID && this.vertexCount >= this._vertexList.length) {
      return;
    } else if (this.vertexCount >= this._vertexList.length) {
      this.vertexCount = 0;
    }
    this._transformID = this.transform._worldID;
    this.vertexCount++;

    const worldTransform = this.transform.worldTransform;
    const anchor = this._anchor;

    // const { x: dx, y: dy } = sprite;

    const skewFactor = italic ? Math.sin(-0.207) : 0;

    const wt = worldTransform;
    const a = wt.a;
    const b = wt.b;
    const c = wt.c = skewFactor;
    const d = wt.d;
    const tx = wt.tx - y * skewFactor;
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

    w1 = (x - anchor._x * width);
    w0 = w1 + width;
    h1 = (y - anchor._y * height);
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
}