import { Color } from './../../src/utils/Color.js';
import * as wasm from './mmap_bg.wasm';

let cachegetUint8Memory = null;
function getUint8Memory() {
    if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory;
}

let WASM_VECTOR_LEN = 0;

function passArray8ToWasm(arg) {
    const ptr = wasm.__wbindgen_malloc(arg.length * 1);
    getUint8Memory().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

const heap = new Array(32);

heap.fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function notDefined(what) { return () => { throw new Error(`${what} is not defined`); }; }

function getObject(idx) { return heap[idx]; }

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm(arg) {

    let len = arg.length;
    let ptr = wasm.__wbindgen_malloc(len);

    const mem = getUint8Memory();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = wasm.__wbindgen_realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachegetInt32Memory = null;
function getInt32Memory() {
    if (cachegetInt32Memory === null || cachegetInt32Memory.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

function getStringFromWasm(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));
}
/**
*/
export const FractalType = Object.freeze({ MANDELBROT:0,JULIA:1, });
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
    * @param {number} new_point_x
    * @param {number} new_point_y
    */
    set_julia_point(new_point_x, new_point_y) {
        wasm.mandelbrot_set_julia_point(this.ptr, new_point_x, new_point_y);
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
    * @param {number} new_type
    */
    set_fractal_type(new_type) {
        wasm.mandelbrot_set_fractal_type(this.ptr, new_type);
    }
    /**
    * @param {number} width
    * @param {number} height
    * @param {number} pixel_size
    * @param {number} max_i
    * @param {number} centre_coords_x
    * @param {number} centre_coords_y
    * @param {number} julia_point_x
    * @param {number} julia_point_y
    * @param {number} fractal_type
    * @returns {Mandelbrot}
    */
    static new(width, height, pixel_size, max_i, centre_coords_x, centre_coords_y, julia_point_x, julia_point_y, fractal_type) {
        const ret = wasm.mandelbrot_new(width, height, pixel_size, max_i, centre_coords_x, centre_coords_y, julia_point_x, julia_point_y, fractal_type);
        return Mandelbrot.__wrap(ret);
    }
    /**
    * @param {Uint8Array} new_arr
    */
    set_arr(new_arr) {
        wasm.mandelbrot_set_arr(this.ptr, passArray8ToWasm(new_arr), WASM_VECTOR_LEN);
    }
    /**
    * @param {any} x_rect
    * @param {any} y_rect
    * @param {number} delta_x
    * @param {number} delta_y
    * @param {Uint8Array} old_arr
    * @param {number} start_row
    * @param {number} end_row
    * @param {number} width
    * @param {number} height
    * @param {number} centre_coords_x
    * @param {number} centre_coords_y
    * @returns {number}
    */
    render_range(x_rect, y_rect, delta_x, delta_y, old_arr, start_row, end_row, width, height, centre_coords_x, centre_coords_y) {
        const ret = wasm.mandelbrot_render_range(this.ptr, addHeapObject(x_rect), addHeapObject(y_rect), delta_x, delta_y, passArray8ToWasm(old_arr), WASM_VECTOR_LEN, start_row, end_row, width, height, centre_coords_x, centre_coords_y);
        return ret;
    }
    /**
    * @param {number} pixel_num
    * @returns {number}
    */
    escape_algorithm(pixel_num) {
        const ret = wasm.mandelbrot_escape_algorithm(this.ptr, pixel_num);
        return ret;
    }
    /**
    * @param {number} pixel_size
    * @param {number} width
    * @param {number} height
    * @param {number} centre_coords_x
    * @param {number} centre_coords_y
    * @param {number} max_i
    */
    update(pixel_size, width, height, centre_coords_x, centre_coords_y, max_i) {
        wasm.mandelbrot_update(this.ptr, pixel_size, width, height, centre_coords_x, centre_coords_y, max_i);
    }
    /**
    * @param {number} start
    * @param {number} end
    * @param {number} pixel_size
    * @param {number} width
    * @param {number} height
    * @param {number} centre_coords_x
    * @param {number} centre_coords_y
    * @param {number} max_i
    * @returns {number}
    */
    render_from_to(start, end, pixel_size, width, height, centre_coords_x, centre_coords_y, max_i) {
        const ret = wasm.mandelbrot_render_from_to(this.ptr, start, end, pixel_size, width, height, centre_coords_x, centre_coords_y, max_i);
        return ret;
    }
}

export const __wbg_log_f514957e1fd60c0f = typeof console.log == 'function' ? console.log : notDefined('console.log');

export const __wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
};

export const __wbg_new_7ec3f098f66c802b = function(arg0, arg1, arg2) {
    const ret = new Color(arg0, arg1, arg2);
    return addHeapObject(ret);
};

export const __wbg_getWidth_1ae57a7e6157a6d6 = function(arg0) {
    const ret = getObject(arg0).getWidth();
    return ret;
};

export const __wbg_getLeft_ab549f1b5875807a = function(arg0) {
    const ret = getObject(arg0).getLeft();
    return ret;
};

export const __wbg_getTop_9e6975569e1a0019 = function(arg0) {
    const ret = getObject(arg0).getTop();
    return ret;
};

export const __wbg_getHeight_37735ff51b725345 = function(arg0) {
    const ret = getObject(arg0).getHeight();
    return ret;
};

export const __wbg_new_59cb74e423758ede = function() {
    const ret = new Error();
    return addHeapObject(ret);
};

export const __wbg_stack_558ba5917b466edd = function(arg0, arg1) {
    const ret = getObject(arg1).stack;
    const ret0 = passStringToWasm(ret);
    const ret1 = WASM_VECTOR_LEN;
    getInt32Memory()[arg0 / 4 + 0] = ret0;
    getInt32Memory()[arg0 / 4 + 1] = ret1;
};

export const __wbg_error_4bb6c2a97407129a = function(arg0, arg1) {
    const v0 = getStringFromWasm(arg0, arg1).slice();
    wasm.__wbindgen_free(arg0, arg1 * 1);
    console.error(v0);
};

export const __wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm(arg0, arg1));
};

