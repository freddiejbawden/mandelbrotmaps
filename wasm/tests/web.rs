//! Test suite for the Web and headless browsers.

#![cfg(target_arch = "wasm32")]
extern crate mmap;
use mmap::Mandelbrot;

extern crate wasm_bindgen_test;
use wasm_bindgen_test::*;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn escape_1() {
  let _m = Mandelbrot::new(1440, 480,-3.16 ,-0.72, 0.003, 200);
  assert_eq!(_m.escape_algorithm(0),1);
}
#[wasm_bindgen_test]
fn escape_max_i_200() {
  let mut _m = Mandelbrot::new(1440, 480,-3.16 ,-0.72, 0.003, 200);
  assert_eq!(_m.escape_algorithm(483404),200);
  _m.setMaxI(1000);
  assert_eq!(_m.escape_algorithm(483404),1000);


}
#[wasm_bindgen_test]
fn escape_max_i_1000() {
  
}


