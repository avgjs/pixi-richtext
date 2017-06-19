const PIXI = require('pixi.js');

const vert = `
precision highp float;
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aColor;
uniform mat3 projectionMatrix;
varying vec2 vTextureCoord;
varying vec2 vFilterCoord;
// varying vec4 vColor;
void main(void){
   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
   vTextureCoord = aTextureCoord / 2.5;
  //  vColor = vec4(aColor.rgb * aColor.a, aColor.a);
}
`;
// stroke
let buffer = '0.32';
let gamma = '0.05'
// fill
// let buffer = '0.75';
// let gamma = '0.05';

const frag = `
precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;

void main(void)
{
    // gl_FragColor = texture2D(uSampler, vTextureCoord);
    float dist = texture2D(uSampler, vTextureCoord).r;
    float alpha = smoothstep(${buffer} - ${gamma}, ${buffer} + ${gamma}, dist);
    // gl_FragColor = vec4(alpha, vec2(0, 0), 0.5);
    gl_FragColor = vec4(vec3(1.0, 0, 0), alpha * 1.);
}
`;

export default class BetterTextShader extends PIXI.Shader {
  constructor(gl, vertexSrc, fragmentSrc, customUniforms, customAttributes) {
    super(gl, vert, frag, customUniforms, customAttributes);
  }
}

// PIXI.ShaderManager.registerPlugin('betterTextShader', BetterTextShader);
