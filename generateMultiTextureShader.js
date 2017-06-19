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
attribute float aStroke;
attribute float aFill;
attribute float aGamma;
attribute vec3 aStrokeColor;
attribute vec3 aFillColor;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;
varying vec4 vColor;
varying float vTextureId;
varying float vStroke;
varying float vFill;
varying float vGamma;
varying vec3 vStrokeColor;
varying vec3 vFillColor;

void main(void){
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

    vTextureCoord = aTextureCoord;
    vTextureId = aTextureId;
    vColor = vec4(aColor.rgb * aColor.a, aColor.a);
    vStroke = aStroke;
    vFill = aFill;
    vGamma = aGamma;
    vStrokeColor = aStrokeColor;
    vFillColor = aFillColor;
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
    varying float vStroke;
    varying float vFill;
    varying float vGamma;
    varying vec3 vStrokeColor;
    varying vec3 vFillColor;
    `,

    'void main(void){',
    // 'vec4 color;',
    'float alphaStroke;',
    'float alphaFill;',
    'vec4 colorStroke;',
    'vec4 colorFill;',
    'float textureId = floor(vTextureId+0.5);',
    '%forloop%',
    'gl_FragColor = mix(colorStroke, colorFill, alphaFill) * vColor;',
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
          alphaStroke = smoothstep(vStroke - vGamma, vStroke + vGamma, dist);
          alphaFill = smoothstep(vFill - vGamma, vFill + vGamma, dist);
          // gl_FragColor = vec4(alpha, vec2(0, 0), 0.5);
          colorStroke = vec4(vStrokeColor, alphaStroke * 1.);
          colorFill = vec4(vFillColor, alphaFill * 1.);
        }`;

        // src += '\n{';
        // src += `\n\tcolor = texture2D(uSamplers[${i}], vTextureCoord);`;
        // src += '\n}';
    }

    src += '\n';
    src += '\n';

    return src;
}