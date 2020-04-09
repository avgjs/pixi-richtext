const Renderer = PIXI.Renderer;
import { getBatchShaderGenerator } from './generateMultiTextureShader';
import RichText, { VetextInfo } from './RichText';
const settings = PIXI.settings;
    
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
    _bufferedElements: VetextInfo[];
    _attributeBuffer: PIXI.ViewableBuffer;
    _indexBuffer: Uint16Array;
    _dcIndex: number;
    _aIndex: number;
    _iIndex: number;
    _target: RichText;
    _tempBoundTextures: any[];
    _batchCount: number = 0;

    constructor(renderer: PIXI.Renderer) {
        super(renderer);

        this.shaderGenerator = getBatchShaderGenerator();
        this.geometryClass = BatchRichTextGeometry;
        this.vertexSize = 6 + 13;
        this.size = Math.round(settings.SPRITE_BATCH_SIZE / 2);
    }

    render (element: RichText){
        if (element.vertexList.length <= 0)
        {
            return;
        }
        this._target = element;      

        let count = Math.ceil(this._target.vertexList.length / this.size);
        for(let i=0;i<count;i++) {
            let start = 0, end = 0;
            if (this._target.vertexList.length < this.size) {
                end = this._target.vertexList.length;  
            } else {
                start = i * this.size;
                end = Math.min((i + 1) * this.size, this._target.vertexList.length);
            }
            this._indexCount += (end - start) * 6;
            this._vertexCount += (end - start) * 4;

            for(let i = start; i < end; i++) {
                let v = this._target.vertexList[i];
                this._bufferedTextures[this._bufferSize] = v.baseTexture;
                this._bufferedElements[this._bufferSize] = v;
                this._bufferSize++;
            }

            this.flush();
        }
    }

    buildDrawCalls (texArray: PIXI.BatchTextureArray, start: number, finish: number)
    {        
        var ref = this;
        var charsInfo = ref._bufferedElements;
        var _attributeBuffer = ref._attributeBuffer;
        var _indexBuffer = ref._indexBuffer;
        var vertexSize = ref.vertexSize;
        var drawCalls = PIXI.AbstractBatchRenderer._drawCallPool;

        var dcIndex = this._dcIndex;
        var aIndex = this._aIndex;
        var iIndex = this._iIndex;

        var drawCall: any = drawCalls[dcIndex];
        drawCall.start = this._iIndex;
        drawCall.texArray = texArray;

        for (var i = start; i < finish; ++i)
        {
            var cInfo = charsInfo[i];
            var tex = cInfo.baseTexture;
            var spriteBlendMode = PIXI.utils.premultiplyBlendMode[
                tex.alphaMode ? 1 : 0][this._target.blendMode];

            charsInfo[i] = null;

            if (start < i && drawCall.blend !== spriteBlendMode)
            {
                drawCall.size = iIndex - drawCall.start;
                start = i;
                drawCall = drawCalls[++dcIndex];
                drawCall.texArray = texArray;
                drawCall.start = iIndex;
            }

            this._packInterleavedGeometry(cInfo, _attributeBuffer, _indexBuffer, aIndex, iIndex);
            aIndex += 8 / 2 * vertexSize;
            iIndex += 6;

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

    _packInterleavedGeometry (cInfo: VetextInfo, attributeBuffer:PIXI.ViewableBuffer, indexBuffer:Uint16Array, aIndex:number, iIndex:number)
    {
        var uint32View = attributeBuffer.uint32View;
        var float32View = attributeBuffer.float32View;

        var packedVertices = aIndex / this.vertexSize;

        let alpha = Math.min(cInfo.worldAlpha, 1.0);
        var argb = (alpha < 1.0
            && cInfo.baseTexture.alphaMode)
            ? PIXI.utils.premultiplyTint(cInfo.tintRGB, alpha)
            : cInfo.tintRGB + (alpha * 255 << 24);
        
        let cnt = cInfo.vertexData.length/2;
        for(let i=0; i<cnt;i++) {
            float32View[aIndex++] = cInfo.vertexData[i*2];
            float32View[aIndex++] = cInfo.vertexData[i*2 + 1];
            float32View[aIndex++] = (cInfo.uvs[i] & 0xFFFF) / 65535;
            float32View[aIndex++] = ((cInfo.uvs[i] >> 16) & 0xFFFF) / 65535;
            uint32View[aIndex++] = argb;
            float32View[aIndex++] = cInfo.baseTexture._batchLocation;   
            
            float32View[aIndex++] = cInfo.shadow;
            float32View[aIndex++] = cInfo.stroke;
            float32View[aIndex++] = cInfo.fill;
            float32View[aIndex++] = cInfo.gamma;
            float32View[aIndex++] = cInfo.shadowBlur;
            uint32View[aIndex++] = cInfo.shadowColor;
            uint32View[aIndex++] = cInfo.strokeColor;
            uint32View[aIndex++] = cInfo.fillColor;                
            float32View[aIndex++] = cInfo.shadowOffset[0];                
            float32View[aIndex++] = cInfo.shadowOffset[1];                                
            float32View[aIndex++] = cInfo.shadowEnable;
            float32View[aIndex++] = cInfo.strokeEnable;
            float32View[aIndex++] = cInfo.fillEnable;
        }

        indexBuffer[iIndex++] = 0 + packedVertices;
        indexBuffer[iIndex++] = 1 + packedVertices;                
        indexBuffer[iIndex++] = 2 + packedVertices;
        indexBuffer[iIndex++] = 0 + packedVertices;
        indexBuffer[iIndex++] = 2 + packedVertices;                
        indexBuffer[iIndex++] = 3 + packedVertices; 
    }
}

Renderer.registerPlugin('richtext', RichTextRenderer as any);