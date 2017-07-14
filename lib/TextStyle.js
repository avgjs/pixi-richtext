import { getSDFTexture, getTextData, getSDFConfig } from './SDFCache';
const sdfConfig = getSDFConfig();

import Color from 'color';

const defaultStyle = {
  // align: 'left',
  // breakWords: false,
  fillEnable: true,
  fillColor: 'black',
  fillAlpha: 1,

  shadowEnable: false,
  shadowColor: 'black',
  shadowAlpha: 1,
  shadowAngle: Math.PI / 6,
  shadowDistance: 5,
  shadowThickness: 2,
  shadowBlur: 0.15, // how to compute?
  // fillGradientType: TEXT_GRADIENT.LINEAR_VERTICAL,
  // fillGradientStops: [],

  strokeEnable: false,
  strokeColor: 'black',
  strokeAlpha: 1,
  strokeThickness: 0,

  fontFamily: 'Arial',
  fontSize: 26,
  // fontStyle: 'normal',
  // fontVariant: 'normal',
  // fontWeight: 'normal',
  italic: false,
  bold: false,
  strike: false,
  underline: false,

  // letterSpacing: 0,
  // lineHeight: 0,

  // padding: 0,
  
  // textBaseline: 'alphabetic',
  // trim: false,
  // wordWrap: false,
  // wordWrapWidth: 100,
};

export default class TextStyle {
  constructor(style) {
    Object.assign(this, defaultStyle, style);
  }
  clone() {
    const clonedProperties = {};
    for (const key in defaultStyle) {
      clonedProperties[key] = this[key];
    }
    return new TextStyle(clonedProperties);
  }
  reset() {
    Object.assign(this, defaultStyle);
  }

  get state() {
    return {
      fillEnable: +this.fillEnable,
      fillColor: this.fillRGBA,
      fill: this.fill,

      strokeEnable: +this.strokeEnable,
      strokeColor: this.strokeRGBA,
      stroke: this.stroke,

      shadowEnable: +this.shadowEnable,
      shadowColor: this.shadowRGBA,
      shadowOffset: this.shadowOffset,
      shadow: this.shadow,
      shadowBlur: this.shadowBlur,

      gamma: this.gamma,
      baseTexture: getSDFTexture()
    };
  }

  get shadowOffset() {
    const ratio = sdfConfig.size / this.fontSize;

    const coefficient = this.shadowDistance * ratio / sdfConfig.textureSize;
    const offsetX = Math.cos(this.shadowAngle) * coefficient;
    const offsetY = Math.sin(this.shadowAngle) * coefficient;

    return [offsetX, offsetY];
  }
  get fillRGBA() {
    const fillRGB = Color(this.fillColor).rgbNumber();
    return (fillRGB >> 16) + (fillRGB & 0xff00) + ((fillRGB & 0xff) << 16) + (this.fillAlpha * 255 << 24)
  }
  get strokeRGBA() {
    const strokeRGB = Color(this.strokeColor).rgbNumber();
    return (strokeRGB >> 16) + (strokeRGB & 0xff00) + ((strokeRGB & 0xff) << 16) + (this.strokeAlpha * 255 << 24)
  }
  get shadowRGBA() {
    const shadowRGB = Color(this.shadowColor).rgbNumber();
    return (shadowRGB >> 16) + (shadowRGB & 0xff00) + ((shadowRGB & 0xff) << 16) + (this.shadowAlpha * 255 << 24)
  }
  get fill() {
    return 0.74 - (+(!this.strokeEnable)) * 0.01;
  }
  get stroke() {
    return Math.max(0, this.strokeThickness * -0.06 + 0.7);
  }
  get shadow() {
    return Math.max(0, this.shadowThickness * -0.06 + 0.7);
  }
  get gamma() {
    return 2 * 1.4142 / (this.fontSize * ((!this.strokeEnable) ? 1 : 1.8));
  }
}