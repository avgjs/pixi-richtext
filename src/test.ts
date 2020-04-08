import RichText from './RichText';
import TextStyle from './TextStyle';
require('./RichTextRenderer');

PIXI.settings.RENDER_OPTIONS.antialias = true;
var app = new PIXI.Application({
  view: document.getElementById('app') as HTMLCanvasElement,
  width: 880,
  height: 1080,
  backgroundColor: 0xffffff,
});

app.renderer.backgroundColor = 0xffffff;

let text = new RichText("你123ABCDF", {fillColor: 0xff0000});
text.position.set(100,100);
app.stage.addChild(text);

// let txt = new PIXI.Text("abc", {fill: 0xff0000});
// txt.position.set(100, 100);
// txt.pluginName = "richtext";
// app.stage.addChild(txt);

// let g = new PIXI.Graphics();
// g.beginFill(0xff0000, 1);
// g.drawCircle(100, 100, 50);
// g.beginFill();
// app.stage.addChild(g);