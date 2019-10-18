import * as wasm from './mmap_bg.wasm';

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

let cachegetUint8Memory = null;
function getUint8Memory() {
    if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory;
}

function getStringFromWasm(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));
}
/**
*/
export class Mandelbrot {

    static __wrap(ptr) {
        const obj = Object.create(Mandelbrot.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_mandelbrot_free(ptr);
    }
    /**
    * @param {number} max_i
    */
    set_max_i(max_i) {
        wasm.mandelbrot_set_max_i(this.ptr, max_i);
    }
    /**
    * @param {number} width
    * @param {number} height
    */
    set_width_height(width, height) {
        wasm.mandelbrot_set_width_height(this.ptr, width, height);
    }
    /**
    * @param {number} fractal_limit_x
    * @param {number} fractal_limit_y
    */
    set_limits(fractal_limit_x, fractal_limit_y) {
        wasm.mandelbrot_set_limits(this.ptr, fractal_limit_x, fractal_limit_y);
    }
    /**
    * @param {number} pixel_size
    */
    set_pixel_size(pixel_size) {
        wasm.mandelbrot_set_pixel_size(this.ptr, pixel_size);
    }
    /**
    */
    static greet() {
        wasm.mandelbrot_greet();
    }
    /**
    * @param {number} width
    * @param {number} height
    * @param {number} fractal_limit_x
    * @param {number} fractal_limit_y
    * @param {number} pixel_size
    * @param {number} max_i
    * @returns {Mandelbrot}
    */
    static new(width, height, fractal_limit_x, fractal_limit_y, pixel_size, max_i) {
        const ret = wasm.mandelbrot_new(width, height, fractal_limit_x, fractal_limit_y, pixel_size, max_i);
        return Mandelbrot.__wrap(ret);
    }
    /**
    * @param {number} pixel_num
    * @returns {number}
    */
    escape_algorithm(pixel_num) {
        const ret = wasm.mandelbrot_escape_algorithm(this.ptr, pixel_num);
        return ret;
    }
}

export const __wbg_alert_c992628627e92c20 = function(arg0, arg1) {
    alert(getStringFromWasm(arg0, arg1));
};

export const __wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm(arg0, arg1));
};

