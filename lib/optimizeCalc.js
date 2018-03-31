import loadWasm from '../rust/src/lib.rs';

const memory = new WebAssembly.Memory({ initial: 20 });

const Module = {};

const imports = {
  env: {
    hello_insert_dom(sum) {
      const h1 = document.createElement('h1');
      h1.innerHTML = 'Hello, world ' + sum;
      const body = document.querySelector('body');
      body.appendChild(h1);
    },
    jsConsoleLog(x, b) {
      console.log(x, b)
    },
    memory
  }
}

// Copy a nul-terminated string from the buffer pointed to.
// Consumes the old data and thus deallocated it.
function copyCStr(module, ptr) {
  let orig_ptr = ptr;
  const collectCString = function* () {
    let memory = new Uint8Array(module.memory.buffer);
    while (memory[ptr] !== 0) {
      if (memory[ptr] === undefined) { throw new Error("Tried to read undef mem") }
      yield memory[ptr]
      ptr += 1
    }
  }

  const buffer_as_u8 = new Uint8Array(collectCString())
  const utf8Decoder = new TextDecoder("UTF-8");
  const buffer_as_utf8 = utf8Decoder.decode(buffer_as_u8);
  module.dealloc_str(orig_ptr);
  return buffer_as_utf8
}

function getStr(module, ptr, len) {
  const getData = function* (ptr, len) {
    let memory = new Uint8Array(module.memory.buffer);
    for (let index = 0; index < len; index++) {
      if (memory[ptr] === undefined) { throw new Error(`Tried to read undef mem at ${ptr}`) }
      yield memory[ptr + index]
    }
  }

  const buffer_as_u8 = new Uint8Array(getData(ptr / 8, len / 8));
  const utf8Decoder = new TextDecoder("UTF-8");
  const buffer_as_utf8 = utf8Decoder.decode(buffer_as_u8);
  return buffer_as_utf8;
}

function newString(module, str) {
  const utf8Encoder = new TextEncoder("UTF-8");
  let string_buffer = utf8Encoder.encode(str)
  let len = string_buffer.length
  let ptr = module.alloc(len + 1)

  let memory = new Uint8Array(module.memory.buffer);
  for (i = 0; i < len; i++) {
    memory[ptr + i] = string_buffer[i]
  }

  memory[ptr + len] = 0;

  return ptr;
}

function newArray(module, arr) {
  const len = arr.length;
  let ptr = module.alloc(len + 1);

  let memory = new Uint8ClampedArray(module.memory.buffer, ptr, len);

  for (let i = 0; i < len; i++) {
    memory[i] = arr[i];
  }
  memory[len] = 0;

  return [ptr, memory];
}

function getArray(type, size, arr) {
  let ArrayConstructor;
  if (type === 'f64') {
    ArrayConstructor = Float64Array;
  } else if (type === 'f32') {
    ArrayConstructor = Float32Array;
  } else if (type === 'i8') {
    ArrayConstructor = Int8Array;
  } else if (type === 'i16') {
    ArrayConstructor = Int16Array;
  } else if (type === 'i32') {
    ArrayConstructor = Int32Array;
  } else if (type === 'u8') {
    ArrayConstructor = Uint8Array;
  } else if (type === 'u16') {
    ArrayConstructor = Uint16Array;
  } else if (type === 'u32') {
    ArrayConstructor = Uint32Array;
  } else if (type === 'u8clamped') {
    ArrayConstructor = Uint8ClampedArray;
  } else {
    throw new Error('wrong type');
  }

  let byteLength = ArrayConstructor.BYTES_PER_ELEMENT * size;
  let ptr = Module.alloc(byteLength + 1);

  let array = new ArrayConstructor(Module.memory.buffer, ptr, size);

  if (arr) {
    for (let i = 0; i < size; i++) {
      array[i] = arr[i];
    }
    array[size] = 0;
  }


  array.pointer = ptr;

  return array;
}

export default function () {
  return loadWasm(imports).then(mod => {

    // const memory = new WebAssembly.Memory({ initial: 21 });

    const exports = mod.instance.exports;
    Module.memory = mod.instance.exports.memory;
    Module.alloc = mod.instance.exports.alloc;
    Module.dealloc = mod.instance.exports.dealloc;
    Module.dealloc_str = mod.instance.exports.dealloc_str;
    Module.getArray = getArray;
    Module.edt1d = mod.instance.exports.edt1d;
    Module.edt = mod.instance.exports.edt;
    Module.roundtrip = function (str) {
      let buf = newString(Module, str);
      let outptr = mod.instance.exports.roundtrip(buf);
      let result = copyCStr(Module, outptr);
      return result;
    };

    // const add = result.instance.exports['hello_call_js'];
    // console.log('return value was', add(2, 3));
    return Module;
  });
}