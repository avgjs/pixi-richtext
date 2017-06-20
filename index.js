const PIXI = require('pixi.js');
import './BetterTextRenderer';
import TinySDF from './lib/SDF';
import { getSDFTexture, getTextData } from './lib/SDFCache';

PIXI.settings.RENDER_OPTIONS.antialias = true;
var app = new PIXI.Application({
  view: document.getElementById('app'),
  width: 1280,
  height: 720
});

app.renderer.backgroundColor = 0x888888;

class BetterText extends PIXI.Sprite {
  constructor(text, style = {}) {
    super();

    this.style = new PIXI.TextStyle(style);


    // scale = 128
    // halo = 0.55
    // gamma = 2

    // buffer_stroke = halo   

    // buffer_fill = 0.75
    // gamma = gamma * 1.4142 / (fontSize * 2)

    this.style.fontSize = 24;



    this.uStroke = 0.50;    //0.50
    this.uFill = 0.76;      //0.73
    this.uGamma = 2 * 1.4142 / (this.style.fontSize * 1.5);
    this.uStrokeColor = [1.0, 1.0, 1.0];
    this.uFillColor = [.0, 0, 0];

    this._text = text;
    // this.generateTexture();
    this.texture = new PIXI.Texture(getSDFTexture());

    this.characterData = [];
    this.needUpdateCharacter = true;

    /**
     * Plugin that is responsible for rendering this element.
     * Allows to customize the rendering process without overriding '_renderWebGL' & '_renderCanvas' methods.
     *
     * @member {string}
     * @default 'sprite'
     */
    this.pluginName = 'bettertext';

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
  /**
   * calculates worldTransform * vertices, store it in vertexData
   */
  calculateVertices(x, y, width, height) {
    // if (this._transformID === this.transform._worldID && this._textureID === this._texture._updateID) {
    //   return;
    // }
    // this._transformID = this.transform._worldID;
    // this._textureID = this._texture._updateID;
    // set the vertex data
    // const texture = this._texture;
    const wt = this.transform.worldTransform;
    const a = wt.a;
    const b = wt.b;
    const c = wt.c;
    const d = wt.d;
    const tx = wt.tx;
    const ty = wt.ty;
    const anchor = this._anchor;
    let w0 = 0;
    let w1 = 0;
    let h0 = 0;
    let h1 = 0;


    // w1 = -anchor._x * orig.width;
    // w0 = w1 + orig.width;
    // h1 = -anchor._y * orig.height;
    // h0 = h1 + orig.height;

    const ratio = 1 / (64 / this.style.fontSize);

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
  generateCharacterData() {
    this.characterData = [];

    const uvVertexData = getTextData(this.text);

    let x = 0;
    let y = 0;

    for (const [uv0, uv1, uv2, uv3, width, height] of uvVertexData) {
      const ratio = width / height;
      const vertexData = this.calculateVertices(x, y, width, height);

      x += width - 64 / 4;
      y += 0;

      const character = {
        worldAlpha: this.worldAlpha,
        tintRGB: this._tintRGB,
        stroke: this.uStroke,
        fill: this.uFill,
        gamma: this.uGamma,
        strokeColor: this.uStrokeColor,
        fillColor: this.uFillColor,
        textureId: this._texture.baseTexture._virtalBoundId,
        _texture: this._texture,
        blendMode: this.blendMode,
        uvs: new Uint32Array([uv0, uv1, uv2, uv3]),
        vertexData
      };

      this.characterData.push(character);
    }
  }
  _renderWebGL(renderer) {
    const gl = renderer.gl;
    // gl.getExtension("OES_standard_derivatives");
    // console.log(gl)
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
    gl.enable(gl.BLEND);

    if (this.needUpdateCharacter) {
      this.generateCharacterData();
      this.needUpdateCharacter = false;
    }

    renderer.setObjectRenderer(renderer.plugins[this.pluginName]);
    renderer.plugins[this.pluginName].render(this);
    // super._renderWebGL(renderer);
    // renderer.setObjectRenderer(renderer.plugins.bettertext);
    // renderer.plugins.bettertext.render(this);
  }
}


var text = new BetterText('test泽材灭逐莫笔亡鲜词圣择寻厂睡博');
app.stage.addChild(text);

window.text = text;


var sprite = new PIXI.Sprite(new PIXI.Texture(getSDFTexture()));
sprite.x = -0;
sprite.y = 200;
app.stage.addChild(sprite)

// var image = new PIXI.Sprite.fromImage('img.png');
// app.stage.addChild(image);