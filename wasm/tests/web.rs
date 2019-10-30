//! Test suite for the Web and headless browsers.

#![cfg(target_arch = "wasm32")]
extern crate mmap;
use mmap::Mandelbrot;

extern crate wasm_bindgen_test;
use wasm_bindgen_test::*;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn escape_1() {
  let _m = Mandelbrot::new(5, 5,0.03, 200,-1.0,0.0);
  let fractal = _m.render();
  assert_eq!(fractal.len(),5*5*4);
}



