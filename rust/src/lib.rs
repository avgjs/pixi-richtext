//! a WebAssembly module with Rust
#![feature(wasm_import_memory)]


use std::mem;
use std::ffi::CString;
use std::slice;
use std::os::raw::{c_char, c_void};
use std::f64::INFINITY;

extern {
}

#[no_mangle]
pub extern "C" fn alloc(size: usize) -> *mut c_void {
    let mut buf = Vec::with_capacity(size);
    let ptr = buf.as_mut_ptr();
    mem::forget(buf);
    return ptr as *mut c_void;
}

#[no_mangle]
pub extern "C" fn dealloc(ptr: *mut c_void, cap: usize) {
    unsafe  {
        let _buf = Vec::from_raw_parts(ptr, 0, cap);
    }
}

#[no_mangle]
pub extern "C" fn dealloc_str(ptr: *mut c_char) {
    unsafe {
        let _ = CString::from_raw(ptr);
    }
}

#[no_mangle]
pub extern fn edt(data_p: *mut i32, data_size: usize, 
                width: usize, height: usize, 
                f_p: *mut f64, f_size: usize, 
                d_p: *mut f64, d_size: usize,
                v_p: *mut i16, v_size: usize,
                z_p: *mut f64, z_size: usize) {

    let data = unsafe { slice::from_raw_parts_mut(data_p, data_size) };
    let f = unsafe { slice::from_raw_parts_mut(f_p, f_size) };
    let d = unsafe { slice::from_raw_parts_mut(d_p, d_size) };
    let v = unsafe { slice::from_raw_parts_mut(v_p, v_size) };
    let z = unsafe { slice::from_raw_parts_mut(z_p, z_size) };


    for x in 0..width {
        for y in 0..height {
            f[y] = data[y * width + x] as f64;
        }
        edt1d_inner(f, d, v, z, height);
        for y in 0..height {
            data[y * width + x] = d[y] as i32;
        }
    }

    for y in 0..height {
        for x in 0..width {
            f[x] = data[y * width + x] as f64;
        }
        edt1d_inner(f, d, v, z, width);
        for x in 0..width {
            data[y * width + x] = d[x].sqrt() as i32;
        }
    }
}

#[no_mangle]
pub extern fn edt1d(f_p: *mut f64, f_size: usize, 
                    d_p: *mut f64, d_size: usize,
                    v_p: *mut i16, v_size: usize,
                    z_p: *mut f64, z_size: usize,
                    n: usize) {

    let f = unsafe { slice::from_raw_parts_mut(f_p, f_size) };
    let d = unsafe { slice::from_raw_parts_mut(d_p, d_size) };
    let v = unsafe { slice::from_raw_parts_mut(v_p, v_size) };
    let z = unsafe { slice::from_raw_parts_mut(z_p, z_size) };
    // let n = unsafe { slice::from_raw_parts_mut(n_p, n_size) };
    edt1d_inner(f, d, v, z, n);
}

fn edt1d_inner(f: &mut [f64], d: &mut [f64], v: &mut [i16], z: &mut [f64], n: usize) {
    v[0] = 0;
    z[0] = -INFINITY;
    z[1] = INFINITY;

    let mut q: f64 = 1.;
    let mut k = 0;
    while (q as usize) < n {
        let q_usize = q as usize;
        let v_k_ = v[k] as f64;
        let mut s = ((f[q_usize] + q * q) - (f[v[k] as usize] + v_k_ * v_k_)) / (2. * q - 2. * v_k_);
        while s <= z[k] {
            k -= 1;
            s = ((f[q_usize] + q * q) - (f[v[k] as usize] + v_k_ * v_k_)) / (2. * q - 2. * v_k_);
        }
        k += 1;
        v[k] = q as i16;
        z[k] = s;
        z[k + 1] = INFINITY;

        q += 1.;
    }

    q = 0.;
    k = 0;
    while (q as usize) < n {
        while z[k + 1] < q {
            k += 1;
        }

        let ret = q - v[k] as f64;

        d[q as usize] = (ret * ret) + f[v[k] as usize];

        q += 1.;
    }
}
