const PIXI = require('pixi.js');
import './BetterTextRenderer';
import TinySDF from './lib/SDF';
import { getSDFTexture, getTextData, getSDFConfig } from './lib/SDFCache';

PIXI.settings.RENDER_OPTIONS.antialias = true;
var app = new PIXI.Application({
  view: document.getElementById('app'),
  width: 1280,
  height: 720
});

app.renderer.backgroundColor = 0x888888;

const sdfConfig = getSDFConfig();

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

    // this.style.fontSize = 24;



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

    const ratio = 1 / (sdfConfig.size / this.style.fontSize);

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

      x += width - sdfConfig.buffer * 2;
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
var text2 = new PIXI.Text('test泽材灭逐莫笔亡鲜词圣择寻厂睡博');
text2.y = 50;
// text2.style.fontSize = 24;
text2.style.stroke = 0xffffff;
text2.style.strokeThickness = 3;
app.stage.addChild(text2);

window.text = text;


var sprite = new PIXI.Sprite(new PIXI.Texture(getSDFTexture()));
sprite.x = -0;
sprite.y = 200;
app.stage.addChild(sprite)

// var image = new PIXI.Sprite.fromImage('img.png');
// app.stage.addChild(image);

var chars = `我与父亲不相见已二年余了，我最不能忘记的是他的背影。那年冬天，祖母死了，父亲的差使也交卸了，正是祸不单行的日子，我从北京到徐州，打算跟着父亲奔丧回家。到徐州见着父亲，看见满院狼藉的东西，又想起祖母，不禁簌簌地流下眼泪。父亲说，“事已如此，不必难过，好在天无绝人之路！”
　　回家变卖典质，父亲还了亏空；又借钱办了丧事。这些日子，家中光景很是惨淡，一半为了丧事，一半为了父亲赋闲。丧事完毕，父亲要到南京谋事，我也要回北京念书，我们便同行。
　　到南京时，有朋友约去游逛，勾留了一日；第二日上午便须渡江到浦口，下午上车北去。父亲因为事忙，本已说定不送我，叫旅馆里一个熟识的茶房陪我同去。他再三嘱咐茶房，甚是仔细。但他终于不放心，怕茶房不妥帖；颇踌躇了一会。其实我那年已二十岁，北京已来往过两三次，是没有甚么要紧的了。他踌躇了一会，终于决定还是自己送我去。我两三回劝他不必去；他只说，“不要紧，他们去不好！”
　　我们过了江，进了车站。我买票，他忙着照看行李。行李太多了，得向脚夫行些小费，才可过去。他便又忙着和他们讲价钱。我那时真是聪明过分，总觉他说话不大漂亮，非自己插嘴不可。但他终于讲定了价钱；就送我上车。他给我拣定了靠车门的一张椅子；我将他给我做的紫毛大衣铺好坐位。他嘱我路上小心，夜里警醒些，不要受凉。又嘱托茶房好好照应我。我心里暗笑他的迂；他们只认得钱，托他们直是白托！而且我这样大年纪的人，难道还不能料理自己么？唉，我现在想想，那时真是太聪明了！
　　我说道，“爸爸，你走吧。”他望车外看了看，说，“我买几个橘子去。你就在此地，不要走动。”我看那边月台的栅栏外有几个卖东西的等着顾客。走到那边月台，须穿过铁道，须跳下去又爬上去。父亲是一个胖子，走过去自然要费事些。我本来要去的，他不肯，只好让他去。我看见他戴着黑布小帽，穿着黑布大马褂，深青布棉袍，蹒跚地走到铁道边，慢慢探身下去，尚不大难。可是他穿过铁道，要爬上那边月台，就不容易了。他用两手攀着上面，两脚再向上缩；他肥胖的身子向左微倾，显出努力的样子。这时我看见他的背影，我的泪很快地流下来了。我赶紧拭干了泪，怕他看见，也怕别人看见。我再向外看时，他已抱了朱红的橘子望回走了。过铁道时，他先将橘子散放在地上，自己慢慢爬下，再抱起橘子走。到这边时，我赶紧去搀他。他和我走到车上，将橘子一股脑儿放在我的皮大衣上。于是扑扑衣上的泥土，心里很轻松似的，过一会说，“我走了；到那边来信！”我望着他走出去。他走了几步，回过头看见我，说，“进去吧，里边没人。”等他的背影混入来来往往的人里，再找不着了，我便进来坐下，我的眼泪又来了。
　　近几年来，父亲和我都是东奔西走，家中光景是一日不如一日。他少年出外谋生，独力支持，做了许多大事。那知老境却如此颓唐！他触目伤怀，自然情不能自已。情郁于中，自然要发之于外；家庭琐屑便往往触他之怒。他待我渐渐不同往日。但最近两年的不见，他终于忘却我的不好，只是惦记着我，惦记着我的儿子。我北来后，他写了一信给我，信中说道，“我身体平安，惟膀子疼痛利害，举箸提笔，诸多不便，大约大去之期不远矣。”我读到此处，在晶莹的泪光中，又看见那肥胖的，青布棉袍，黑布马褂的背影。唉！我不知何时再能与他相见！`;

let i = 0;

// setInterval(() => {
//   const length = (Math.random() * 10) << 0;
//   const textContent = chars.substr(i, length);
//   text.text = textContent;
//   text2.text = textContent;
//   i += length;
// }, 500);
