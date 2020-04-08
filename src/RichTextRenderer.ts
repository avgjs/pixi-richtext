const ObjectRenderer = PIXI.ObjectRenderer;
const Renderer = PIXI.Renderer;
import { getBatchShaderGenerator, vertexSrc, fragTemplate } from './generateMultiTextureShader';
import bitTwiddle from 'bit-twiddle';
import RichText from './RichText';

const checkMaxIfStatementsInShader: (maxIfs: number, gl: WebGLRenderingContext) => number 
        = (PIXI as any).checkMaxIfStatementsInShader;
const createIndicesForQuads = PIXI.utils.createIndicesForQuads;
const settings = PIXI.settings;

var defaultVertex$2 = "precision highp float;\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\nattribute float aTextureId;\n\nuniform mat3 projectionMatrix;\nuniform mat3 translationMatrix;\nuniform vec4 tint;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying float vTextureId;\n\nvoid main(void){\n    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n\n    vTextureCoord = aTextureCoord;\n    vTextureId = aTextureId;\n    vColor = aColor * tint;\n}\n";
var defaultFragment$2 = "varying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying float vTextureId;\nuniform sampler2D uSamplers[%count%];\n\nvoid main(void){\n    vec4 color;\n    %forloop%\n    gl_FragColor = color * vColor;\n}\n";
    
class  BatchRichTextGeometry extends PIXI.BatchGeometry {
    vertByteSize = 19 * 4;
    constructor(_static: boolean = false) {
        super(_static);

        this
            .addIndex(this._indexBuffer)
            .addAttribute('aVertexPosition', this._buffer, 2, false, PIXI.TYPES.FLOAT, this.vertByteSize, 0)
            .addAttribute('aTextureCoord', this._buffer, 2, false, PIXI.TYPES.FLOAT, this.vertByteSize, 2 * 4)
            .addAttribute('aColor', this._buffer, 4, true, PIXI.TYPES.UNSIGNED_BYTE, this.vertByteSize, 4 * 4)
            .addAttribute('aTextureId', this._buffer, 1, true, PIXI.TYPES.FLOAT, this.vertByteSize, 5 * 4)
            .addAttribute('aShadow', this._buffer, 1, false, PIXI.TYPES.FLOAT, this.vertByteSize, 6 * 4)
            .addAttribute('aStroke', this._buffer, 1, false, PIXI.TYPES.FLOAT, this.vertByteSize, 7 * 4)
            .addAttribute('aFill', this._buffer, 1, false, PIXI.TYPES.FLOAT, this.vertByteSize, 8 * 4)       
            .addAttribute('aGamma', this._buffer, 1, false, PIXI.TYPES.FLOAT, this.vertByteSize, 9 * 4)
            .addAttribute('aShadowBlur', this._buffer, 1, false, PIXI.TYPES.FLOAT, this.vertByteSize, 10 * 4)
            .addAttribute('aShadowColor', this._buffer, 4, true, PIXI.TYPES.UNSIGNED_BYTE, this.vertByteSize, 11 * 4)       
            .addAttribute('aStrokeColor', this._buffer, 4, true, PIXI.TYPES.UNSIGNED_BYTE, this.vertByteSize, 12 * 4)     
            .addAttribute('aFillColor', this._buffer, 4, true, PIXI.TYPES.UNSIGNED_BYTE, this.vertByteSize, 13 * 4)    
            .addAttribute('aShadowOffset', this._buffer, 2, false, PIXI.TYPES.FLOAT, this.vertByteSize, 15 * 4)
            .addAttribute('aShadowEnable', this._buffer, 1, false, PIXI.TYPES.FLOAT, this.vertByteSize, 16 * 4)
            .addAttribute('aStrokeEnable', this._buffer, 1, false, PIXI.TYPES.FLOAT, this.vertByteSize, 17 * 4)
            .addAttribute('aFillEnable', this._buffer, 1, false, PIXI.TYPES.FLOAT, this.vertByteSize, 18 * 4);
    }

    addAttribute (id: string, buffer: PIXI.Buffer, size: number, normalized: boolean, type: PIXI.TYPES, stride: number = 0, start: number = 0, instance: boolean = false): BatchRichTextGeometry {
        (PIXI.Geometry.prototype as any).addAttribute.call(this, id, buffer, size, normalized, type, stride, start, instance);
        return this;
    }

    addIndex(buffer: PIXI.Buffer): BatchRichTextGeometry {
        (PIXI.Geometry.prototype as any).addIndex.call(this, buffer);
        return this;
    }
}

/**
 * Renderer dedicated to drawing and batching sprites.
 *
 * @class
 * @private
 * @memberof PIXI
 * @extends PIXI.ObjectRenderer
 */
export default class RichTextRenderer extends PIXI.AbstractBatchRenderer
{
    vertexSize: number;
    _vertexCount: number;
    _indexCount: number;
    _bufferSize: number;
    _bufferedTextures: PIXI.BaseTexture[];
    _bufferedElements: RichText[];
    _attributeBuffer: PIXI.ViewableBuffer;
    _indexBuffer: Uint16Array;
    _dcIndex: number;
    _aIndex: number;
    _iIndex: number;

    constructor(renderer: PIXI.Renderer) {
        super(renderer);

        this.shaderGenerator = getBatchShaderGenerator();
        this.geometryClass = BatchRichTextGeometry;
        this.vertexSize = 6 + 12;
        // this.shaderGenerator = new PIXI.BatchShaderGenerator(defaultVertex$2, defaultFragment$2);
        // this.geometryClass = PIXI.BatchGeometry;
        // this.vertexSize = 6;
    }

    render (element: RichText){
        if (element.vertexList.length <= 0)
        {
            return;
        }

        let vcount = element.vertexList.length * 8 / 2;
        //if (this._vertexCount + vcount > this.size)
        {
            this.flush();
        }

        let vindicesCount = element.vertexList.length * 6;
        this._vertexCount += vcount;
        this._indexCount += vindicesCount;
        this._bufferedTextures[this._bufferSize] = element._texture.baseTexture;
        this._bufferedElements[this._bufferSize++] = element;
    }

    buildDrawCalls (texArray: PIXI.BatchTextureArray, start: number, finish: number)
    {
        var ref = this;
        var elements = ref._bufferedElements;
        var _attributeBuffer = ref._attributeBuffer;
        var _indexBuffer = ref._indexBuffer;
        var vertexSize = ref.vertexSize;
        var drawCalls = PIXI.AbstractBatchRenderer._drawCallPool;

        var dcIndex = this._dcIndex;
        var aIndex = this._aIndex;
        var iIndex = this._iIndex;

        var drawCall: any = drawCalls[dcIndex];

        texArray.elements = [];
        texArray.ids = [];
        for(let elm of elements) {
            for(let v of elm.vertexList) {
                texArray.elements.push(v.baseTexture);
                texArray.ids.push(v.baseTexture._batchLocation);
            }
        }

        drawCall.start = this._iIndex;
        drawCall.texArray = texArray;

        for (var i = start; i < finish; ++i)
        {
            var sprite: any = elements[i];
            var tex = sprite._texture.baseTexture;
            var spriteBlendMode = PIXI.utils.premultiplyBlendMode[
                tex.alphaMode ? 1 : 0][sprite.blendMode];

            elements[i] = null;

            if (start < i && drawCall.blend !== spriteBlendMode)
            {
                drawCall.size = iIndex - drawCall.start;
                start = i;
                drawCall = drawCalls[++dcIndex];
                drawCall.texArray = texArray;
                drawCall.start = iIndex;
            }

            this.packInterleavedGeometry(sprite, _attributeBuffer, _indexBuffer, aIndex, iIndex);
            aIndex += sprite.vertexList.length * 8 / 2 * vertexSize;
            iIndex += sprite.vertexList.length * 6;

            drawCall.blend = spriteBlendMode;
        }

        if (start < finish)
        {
            drawCall.size = iIndex - drawCall.start;
            ++dcIndex;
        }

        this._dcIndex = dcIndex;
        this._aIndex = aIndex;
        this._iIndex = iIndex;
    }

    packInterleavedGeometry (element: RichText, attributeBuffer:PIXI.ViewableBuffer, indexBuffer:Uint16Array, aIndex:number, iIndex:number)
    {
        var uint32View = attributeBuffer.uint32View;
        var float32View = attributeBuffer.float32View;

        var packedVertices = aIndex / this.vertexSize;

        for(let v of element.vertexList) {     
            let alpha = Math.min(v.worldAlpha, 1.0);
            var argb = (alpha < 1.0
                && element._texture.baseTexture.alphaMode)
                ? PIXI.utils.premultiplyTint(v.tintRGB, alpha)
                : v.tintRGB + (alpha * 255 << 24);
            
            let cnt = v.vertexData.length/2;
            for(let i=0; i<cnt;i++) {
                float32View[aIndex++] = v.vertexData[i*2];
                float32View[aIndex++] = v.vertexData[i*2 + 1];
                float32View[aIndex++] = (v.uvs[i] & 0xFFFF) / 65535;
                float32View[aIndex++] = ((v.uvs[i] >> 16) & 0xFFFF) / 65535;
                uint32View[aIndex++] = argb;
                float32View[aIndex++] = v.baseTexture._batchLocation;   
                
                float32View[aIndex++] = v.shadow;
                float32View[aIndex++] = v.stroke;
                float32View[aIndex++] = v.fill;
                float32View[aIndex++] = v.gamma;
                float32View[aIndex++] = v.shadowBlur;
                uint32View[aIndex++] = v.shadowColor;
                uint32View[aIndex++] = v.strokeColor;
                uint32View[aIndex++] = v.fillColor;                
                float32View[aIndex++] = v.shadowOffset[0];                
                float32View[aIndex++] = v.shadowOffset[1];                                
                float32View[aIndex++] = v.shadowEnable;
                float32View[aIndex++] = v.strokeEnable;
                float32View[aIndex++] = v.fillEnable;
            }
        }

        for (var i$1 = 0; i$1 < element.vertexList.length; i$1++)
        {
            let offset = i$1 * 4; 
            indexBuffer[iIndex++] = 0 + offset + packedVertices;
            indexBuffer[iIndex++] = 1 + offset + packedVertices;                
            indexBuffer[iIndex++] = 2 + offset + packedVertices;
            indexBuffer[iIndex++] = 0 + offset + packedVertices;
            indexBuffer[iIndex++] = 2 + offset + packedVertices;                
            indexBuffer[iIndex++] = 3 + offset + packedVertices;   
        }
    }
}

Renderer.registerPlugin('richtext', RichTextRenderer as any);

// let batchRenderer = PIXI.BatchPluginFactory.create({
//     vertex: PIXI.BatchPluginFactory.defaultVertexSrc,
//     fragment: PIXI.BatchPluginFactory.defaultFragmentTemplate,
//     vertexSize: 6,
//     geometryClass: PIXI.BatchGeometry, 
// });
// Renderer.registerPlugin('richtext', batchRenderer);