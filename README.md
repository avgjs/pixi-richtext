# pixi-richtext

Rich-text for PixiJS!

[Online Demo](./static/index.html)

## Feature

- Runtime signed distance field algorithm, with LRU cache for 1024 characters
- Better rendering effect
- No font file required, while supporting custom font via `@font-face`
- Full support for CJK languages
- Layout using [huozi](https://github.com/Icemic/huozi.js)
- Rich-text support

## Usage

```sh
npm install pixi-richtext --save
```

```js
import PIXI from 'pixi.js';
import RichText from 'pixi-richtext';

const app = new PIXI.Application({
  view: document.getElementById('app'),
  width: 1280,
  height: 720
});

const chars = '泽材<fillColor=0xff6600>灭<bold>逐</bold></fillColor>莫笔<strokeEnable=true>亡</strokeEnable>鲜，<strokeEnable=true><strokeColor=black><fillColor=red><fontSize=64>如何</fontSize><fillColor=orange><italic>气</italic><fillColor=yellow><bold>死</bold><fillColor=green>你的<fillColor=0xff6600>设<fillColor=blue>计师<fillColor=magenta><fontSize=28>朋</fontSize>友</fillColor></fillColor></fillColor></fillColor></fillColor></fillColor></fillColor></strokeColor></strokeEnable>';
// see more: https://github.com/Icemic/huozi.js
const layoutOptions = {
  // any valid CSS font-family value is supported
  // includes the fonts imported using @font-face
  fontFamily: 'sans-serif',
  // grid width for layout, 1em = gridSize
  gridSize: 26,
  // max width presented by character count
  // (max-width = (gridSize + xInterval) * column - xInterval)
  column: 25,
  // max line number
  row: Infinity,
  // interval between characters (CJK only)
  xInterval: 0,
  // interval between lines
  yInterval: 12,
  // (for western characters)
  letterSpacing: 0,
  // compress punctuation inline (CJK only)
  inlineCompression: true,
  forceGridAlignment: true,
  // enable it if your text do not include CJK characters
  westernCharacterFirst: false,
  forceSpaceBetweenCJKAndWestern: false
}

const defaultStyle = {
  fillEnable: true,
  fillColor: 'black',
  fillAlpha: 1,

  shadowEnable: false,
  shadowColor: 'black',
  shadowAlpha: 1,
  shadowAngle: Math.PI / 6,
  shadowDistance: 5,
  shadowThickness: 2,
  shadowBlur: 0.15,

  strokeEnable: false,
  strokeColor: 'black',
  strokeAlpha: 1,
  strokeThickness: 0,

  fontFamily: 'sans-serif',
  fontSize: 18,

  italic: false,
  bold: false,

  // unsupported now
  strike: false,
  underline: false,

  layout: layoutOptions
};



const text = new RichText(chars, defaultStyle, layoutOptions);
app.stage.addChild(text);
text.x = 0;
text.y = 100;
```

Just like what you see above, rich-text is expressed by UBB-like code. All the tags in `defaultStyle` are supported. Tags in text will overwrite the style temporarily until the they were closed.

In addition, you can use `text.renderPosition` to make a typewriter effect. See more in `example/demo.js`.

## Todos

- [ ] Support pre-generated SDF texture
- [ ] Generating SDF texture in single channel, which will expend cache number to 4096
- [ ] Support strike and underline
- [ ] Custom SDF algorithm, eg. [msdf](https://github.com/Chlumsky/msdfgen)

## Related Works

- TinySDF (https://github.com/mapbox/tiny-sdf)

## Contribution

Any contribution is welcomed!

## License

MIT LICENSE, SEE [LICENSE](./LICENSE).

