const PIXI = require('pixi.js');
import './BetterTextRenderer';
import { parseRichText } from './utils';
import TextStyle from './TextStyle';

export default class RichText extends PIXI.Sprite {
  constructor(text, style = {}) {
    super();

    this.style = new TextStyle(style);

    this._text = text;

    this.vertexList = [];
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
  _renderWebGL(renderer) {
    const gl = renderer.gl;
    // gl.getExtension("OES_standard_derivatives");
    // console.log(gl)
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
    gl.enable(gl.BLEND);

    if (this.needUpdateCharacter) {
      // this.generateCharacterData();
      this.vertexList = parseRichText(this._text, this);
      this.needUpdateCharacter = false;
    }

    renderer.setObjectRenderer(renderer.plugins[this.pluginName]);
    renderer.plugins[this.pluginName].render(this);
  }
}