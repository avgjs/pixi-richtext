require('./RichTextRenderer');
import { parseRichText } from './utils';
import TextStyle from './TextStyle';
import { getSDFConfig } from './SDFCache';

const sdfConfig = getSDFConfig();

export type VetextInfo = {
  baseTexture: PIXI.BaseTexture,
  blendMode: number,
  character: string,
  fill: number,
  fillColor: number,
  fillEnable: number,
  fontFamily: string,
  fontSize: number,
  gamma: number,
  height: number,
  italic: boolean,
  realHeight: number,
  realWidth: number,
  shadow: number,
  shadowBlur: number,
  shadowColor: number,
  shadowEnable: number,
  shadowOffset: number[],
  stroke: number,
  strokeColor: number,
  strokeEnable: number,
  tintRGB: number,
  uvs: Uint32Array,
  vertexData: number[],
  width: number,
  worldAlpha: number,
  x: number,
  y: number,
}

export default class RichText extends PIXI.Sprite {
  _texture: PIXI.Texture;
  _style: TextStyle;
  _text: string;
  _vertexList: any[];
  needUpdateCharacter: boolean;
  needUpdateTypo: boolean;
  vertexCount: number;
  renderPosition: number;
  _transformID: number;
  vertexData: Float32Array;
  indices: Uint16Array;
  uvs: Float32Array;
  _tintRGB: number;

  constructor(text: string, style?: any | TextStyle) {
    super();

    this._style = new TextStyle(style, style && style.layout || {});

    this._text = text;

    this._vertexList = [];
    this.needUpdateCharacter = true;
    this.needUpdateTypo = true;
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
      this.needUpdateTypo = true;
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
    this._style = new TextStyle(value, value.layout || this._style.layout || {});
    this.needUpdateTypo = true;
    this.needUpdateCharacter = true;
  }
  get layout() {
    return this._style.layout;
  }
  set layout(value) {
    this._style = new TextStyle(this._style, value || {});
    this.needUpdateTypo = true;
    this.needUpdateCharacter = true;
  }
  get width() {
    const { gridSize, xInterval, column } = this._style.layout;

    const { x, y, realWidth, fontSize } = this._vertexList[this.renderPosition === 0 ? 0 : this.renderPosition > 0 ? (this.renderPosition - 1) : this._vertexList.length - 1];
    if (y > 0) {
      return (gridSize + xInterval) * column - xInterval;
    } else {
      const ratio = fontSize / sdfConfig.size;
      const currentWidth = x + realWidth * ratio;
      return currentWidth;
    }
  }
  get height() {
    const { gridSize, yInterval, row } = this._style.layout;
    // if (isFinite(row)) {
    //   return (gridSize + yInterval) * row - yInterval;
    // } else {
    const { y } = this._vertexList[this.renderPosition === 0 ? 0 : this.renderPosition > 0 ? (this.renderPosition - 1) : (this._vertexList.length - 1)];
    return y + gridSize;
    // }
  }
  get vertexList(): VetextInfo[] {
    if (this.renderPosition < 0) {
      return this._vertexList;
    }
    return this._vertexList.slice(0, this.renderPosition);
  }
  get cursorPosition() {
    const { x, y, realWidth, realHeight, fontSize } = this._vertexList[this.renderPosition === 0 ? 0 : this.renderPosition > 0 ? (this.renderPosition - 1) : (this._vertexList.length - 1)];
    const ratio = fontSize / sdfConfig.size;
    return { x: x + realWidth * ratio, y: y };
  }

  /**
   * Gets the local bounds of the text object.
   *
   * @param {Rectangle} rect - The output rectangle.
   * @return {Rectangle} The bounds.
   */
  getLocalBounds(rect?: PIXI.Rectangle) {
    this.updateText();
    return super.getLocalBounds.call(this, rect);
  }
  /**
   * calculates the bounds of the Text as a rectangle. The bounds calculation takes the worldTransform into account.
   */
  _calculateBounds() {
    this.updateText();

    const vertexData = this._calculateVertices(0, 0, this.width, this.height);

    // if we have already done this on THIS frame.
    this._bounds.addQuad(vertexData);
  }

  _render(renderer: PIXI.Renderer) {
    const gl = renderer.gl;

    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
    gl.enable(gl.BLEND);

    if (this._transformID !== (this.transform as any)._worldID) {
      this.needUpdateCharacter = true;
      this._transformID = (this.transform as any)._worldID;
    }

    if (this.needUpdateTypo || this.needUpdateCharacter) {
      this.updateText();
      this.needUpdateCharacter = false;
    }

    let that = (renderer as any);
    renderer.batch.setObjectRenderer(that.plugins[this.pluginName]);
    that.plugins[this.pluginName].render(this);
  }
  
  updateText() {
    if (this.needUpdateTypo) {
      this._vertexList = parseRichText(this._text, this);
      this.needUpdateTypo = false;
    }

    for (const item of this._vertexList) {
      const { realWidth, realHeight, x, y, fontSize, italic } = item;
      const ratio = fontSize / sdfConfig.size;
      var vertexData = this._calculateVertices(x, y, realWidth * ratio, realHeight * ratio, italic);

      if (vertexData) {
        Object.assign(item, { vertexData: vertexData });
      }
    }
  }

  calculateVertices() {
    
  }

  _calculateVertices(x: number, y: number, width: number, height: number, italic: boolean = false) {
    const worldTransform = this.transform.worldTransform;
    const anchor = this.anchor;

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

    w1 = (x - anchor.x * width);
    w0 = w1 + width;
    h1 = (y - anchor.y * height);
    h0 = h1 + height;

    const vertexData = new Float32Array(8);
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