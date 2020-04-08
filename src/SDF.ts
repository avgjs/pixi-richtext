const INF = 1e20;

// 2D Euclidean distance transform by Felzenszwalb & Huttenlocher https://cs.brown.edu/~pff/dt/
function edt(data: Float64Array, width: number, height: number, f: Float64Array, d: Float64Array, v: Int16Array, z: Float64Array) {
  for (var x = 0; x < width; x++) {
    for (var y = 0; y < height; y++) {
      f[y] = data[y * width + x];
    }
    edt1d(f, d, v, z, height);
    for (y = 0; y < height; y++) {
      data[y * width + x] = d[y];
    }
  }
  for (y = 0; y < height; y++) {
    for (x = 0; x < width; x++) {
      f[x] = data[y * width + x];
    }
    edt1d(f, d, v, z, width);
    for (x = 0; x < width; x++) {
      data[y * width + x] = Math.sqrt(d[x]);
    }
  }
}

// 1D squared distance transform
function edt1d(f: Float64Array, d: Float64Array, v: Int16Array, z: Float64Array, n: number) {
  v[0] = 0;
  z[0] = -INF;
  z[1] = +INF;

  for (var q = 1, k = 0; q < n; q++) {
    var s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = +INF;
  }

  for (q = 0, k = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
  }
}

/*!
 * copied and modified from https://github.com/mapbox/tiny-sdf/blob/master/index.js
 * @license Licensed under ISC
 * 
 * @export
 * @class TinySDF
 */
export class TinySDF {
    fontSize: number;
    buffer: number;
    cutoff: number;
    fontFamily: string = 'sans-serif';
    radius: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    size: number;
    gridOuter: Float64Array;
    gridInner: Float64Array;
    f: Float64Array;
    d: Float64Array;
    z: Float64Array;
    v: Int16Array;
    middle: number;

  constructor(fontSize: number = 24, buffer: number = 3, radius: number = 8, cutoff: number = 0.25, fontFamily: string = 'sans-serif') {
    this.fontSize = fontSize || 24;
    this.buffer = buffer === undefined ? 3 : buffer;
    this.cutoff = cutoff || 0.25;
    this.fontFamily = fontFamily || 'sans-serif';
    this.radius = radius || 8;
    var size = this.size = this.fontSize + this.buffer * 2;

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvas.height = size;

    this.ctx = this.canvas.getContext('2d');
    this.ctx.font = this.fontSize + 'px ' + this.fontFamily;
    this.ctx.textBaseline = 'ideographic';
    this.ctx.fillStyle = 'black';
    this.ctx.lineJoin = 'miter';
    this.ctx.miterLimit = 10;

    // temporary arrays for the distance transform
    this.gridOuter = new Float64Array(size * size);
    this.gridInner = new Float64Array(size * size);
    this.f = new Float64Array(size);
    this.d = new Float64Array(size);
    this.z = new Float64Array(size + 1);
    this.v = new Int16Array(size);

    // hack around https://bugzilla.mozilla.org/show_bug.cgi?id=737852
    this.middle = Math.round((size / 2) * 2) + 5//(navigator.userAgent.indexOf('Gecko/') >= 0 ? 1.2 : 1));
  }
  renderToImageData(char: string, fontFamily: string = 'sans-serif') {
    this.fontFamily = fontFamily;
    this.ctx.font = this.fontSize + 'px ' + this.fontFamily;

    this.ctx.clearRect(0, 0, this.size, this.size);
    this.ctx.fillText(char, this.buffer, this.middle);

    var imgData = this.ctx.getImageData(0, 0, this.size, this.size);
    var data = imgData.data;

    for (var i = 0; i < this.size * this.size; i++) {
      var a = data[i * 4 + 3] / 255; // alpha value
      this.gridOuter[i] = a === 1 ? 0 : a === 0 ? INF : Math.pow(Math.max(0, 0.5 - a), 2);
      this.gridInner[i] = a === 1 ? INF : a === 0 ? 0 : Math.pow(Math.max(0, a - 0.5), 2);
    }

    edt(this.gridOuter, this.size, this.size, this.f, this.d, this.v, this.z);
    edt(this.gridInner, this.size, this.size, this.f, this.d, this.v, this.z);

    for (i = 0; i < this.size * this.size; i++) {
      var d = this.gridOuter[i] - this.gridInner[i];
      var c = Math.max(0, Math.min(255, Math.round(255 - 255 * (d / this.radius + this.cutoff))));
      data[4 * i + 0] = c;
      data[4 * i + 1] = c;
      data[4 * i + 2] = c;
      data[4 * i + 3] = 255;
    }

    return imgData;
  }
  measureCharacter(char: string, fontFamily: string = 'sans-serif') {
    this.fontFamily = fontFamily;
    this.ctx.font = this.fontSize + 'px ' + this.fontFamily;

    const width = this.ctx.measureText(char).width + this.buffer * 2;
    const height = this.size;

    return [width, height];
  }
}
