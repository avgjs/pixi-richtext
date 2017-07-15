// import Shader from '../../Shader';
const PIXI = require('pixi.js');
const Shader = PIXI.Shader;
// import { readFileSync } from 'fs';
// import { join } from 'path';

const vertexSrc = `
precision highp float;
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aColor;
attribute float aTextureId;
attribute float aShadow;
attribute float aStroke;
attribute float aFill;
attribute float aGamma;
attribute float aShadowBlur;
attribute vec4 aShadowColor;
attribute vec4 aStrokeColor;
attribute vec4 aFillColor;
attribute vec2 aShadowOffset;
attribute float aShadowEnable;
attribute float aStrokeEnable;
attribute float aFillEnable;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;
varying vec4 vColor;
varying float vTextureId;
varying float vShadow;
varying float vStroke;
varying float vFill;
varying float vGamma;
varying float vShadowBlur;
varying vec4 vShadowColor;
varying vec4 vStrokeColor;
varying vec4 vFillColor;
varying vec2 vShadowOffset;
varying float vShadowEnable;
varying float vStrokeEnable;
varying float vFillEnable;

void main(void){
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

    vTextureCoord = aTextureCoord;
    vTextureId = aTextureId;
    vColor = vec4(aColor.rgb * aColor.a, aColor.a);
    vShadow = aShadow;
    vStroke = aStroke;
    vFill = aFill;
    vGamma = aGamma;
    vShadowColor = aShadowColor;
    vShadowBlur = aShadowBlur;
    vStrokeColor = aStrokeColor;
    vFillColor = aFillColor;
    vShadowOffset = aShadowOffset;
    vShadowEnable = aShadowEnable;
    vStrokeEnable = aStrokeEnable;
    vFillEnable = aFillEnable;
}
`;

const fragTemplate = [
    'varying vec2 vTextureCoord;',
    'varying vec4 vColor;',
    'varying float vTextureId;',
    'uniform sampler2D uSamplers[%count%];',
    // 'uniform float uStroke;',
    // 'uniform float uFill;',
    // 'uniform float uGamma;',
    // 'uniform vec3 uFillColor;',
    // 'uniform vec3 uStrokeColor;',
    `
    varying float vShadow;
    varying float vShadowBlur;
    varying float vStroke;
    varying float vFill;
    varying float vGamma;
    varying vec4 vShadowColor;
    varying vec4 vStrokeColor;
    varying vec4 vFillColor;
    varying vec2 vShadowOffset;
    varying float vShadowEnable;
    varying float vStrokeEnable;
    varying float vFillEnable;
    `,

    'void main(void){',
    // 'vec4 color;',
    'float alphaStroke;',
    'float alphaFill;',
    'vec4 colorStroke;',
    'float alphaShadow;',
    'vec4 colorShadow;',
    'vec4 colorFill;',
    'float textureId = floor(vTextureId+0.5);',
    '%forloop%',
    'vec4 color = mix(colorShadow * vShadowEnable, colorStroke, alphaStroke) * vColor;',
    'gl_FragColor = mix(color, colorFill, alphaFill) * vColor;',
    '}',
].join('\n');

export default function generateMultiTextureShader(gl, maxTextures)
{
    // const vertexSrc = readFileSync(join(__dirname, './texture.vert'), 'utf8');
    let fragmentSrc = fragTemplate;

    fragmentSrc = fragmentSrc.replace(/%count%/gi, maxTextures);
    fragmentSrc = fragmentSrc.replace(/%forloop%/gi, generateSampleSrc(maxTextures));

    const shader = new Shader(gl, vertexSrc, fragmentSrc);

    const sampleValues = [];

    for (let i = 0; i < maxTextures; i++)
    {
        sampleValues[i] = i;
    }

    shader.bind();
    shader.uniforms.uSamplers = sampleValues;

    console.log(shader)
    console.log(gl.getProgramParameter(shader.program, gl.ACTIVE_ATTRIBUTES))

    return shader;
}

function generateSampleSrc(maxTextures)
{
    let src = '';

    src += '\n';
    src += '\n';

    for (let i = 0; i < maxTextures; i++)
    {
        if (i > 0)
        {
            src += '\nelse ';
        }

        if (i < maxTextures - 1)
        {
            src += `if(textureId == ${i}.0)`;
        }

        src += `\n{
          float dist = texture2D(uSamplers[${i}], vTextureCoord).r;
          float distOffset = texture2D(uSamplers[${i}], vTextureCoord.xy - vShadowOffset).r;
          alphaShadow = smoothstep(vShadow - vGamma - vShadowBlur, vShadow + vGamma + vShadowBlur, distOffset);
          alphaStroke = smoothstep(vStroke - vGamma, vStroke + vGamma, dist * vStrokeEnable);
          alphaFill = smoothstep(vFill - vGamma, vFill + vGamma, dist);
          colorShadow = vec4(vShadowColor.rgb, alphaShadow) * vShadowColor.a;
          colorStroke = vec4(vStrokeColor.rgb, alphaStroke) * vStrokeColor.a;
          colorFill = vec4(vFillColor.rgb, alphaFill * vFillEnable) * vFillColor.a;
        }`;

        // src += '\n{';
        // src += `\n\tcolor = texture2D(uSamplers[${i}], vTextureCoord);`;
        // src += '\n}';
    }

    src += '\n';
    src += '\n';

    return src;
}