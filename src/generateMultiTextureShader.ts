export const vertexSrc = `
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
uniform mat3 translationMatrix;
uniform vec4 tint;

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

void main(){
    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

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

export const fragTemplate = [
    'varying vec2 vTextureCoord;',
    'varying vec4 vColor;',
    'varying float vTextureId;',
    'uniform sampler2D uSamplers[%count%];',
    // 'uniform float uStroke;',
    // 'uniform float uFill;',
    // 'uniform float uGamma;',
    // 'uniform vec3 uFillColor;',
    // 'uniform vec3 uStrokeColor;',
    'varying float vShadow;',
    'varying float vShadowBlur;',
    'varying float vStroke;',
    'varying float vFill;',
    'varying float vGamma;',
    'varying vec4 vShadowColor;',
    'varying vec4 vStrokeColor;',
    'varying vec4 vFillColor;',
    'varying vec2 vShadowOffset;',
    'varying float vShadowEnable;',
    'varying float vStrokeEnable;',
    'varying float vFillEnable;',
    
    'const float smoothing = 0.25;',

    'void main(){',
    'vec4 color;',
    'float textureId = floor(vTextureId+0.5);',
    '%forloop%',
    'float distance = color.r;',
    'float alpha = smoothstep(0.5 - smoothing, 0.5 + smoothing, distance);',
    'vec4 c = mix(vShadowColor * vShadowEnable, vStrokeColor, vShadowColor.a);',
    'gl_FragColor = vec4(color.rgb, alpha) * vFillColor;',
    '}',
].join('\n');

let shaderGenerator: PIXI.BatchShaderGenerator;
export function getBatchShaderGenerator() :PIXI.BatchShaderGenerator {    
    if(!shaderGenerator) {
        shaderGenerator = new PIXI.BatchShaderGenerator(vertexSrc, fragTemplate);
    }
    return shaderGenerator;
}