//! Test suite for the Web and headless browsers.

#![cfg(target_arch = "wasm32")]
extern crate mmap;
use mmap::Mandelbrot;
use mmap::Rectangle;
extern crate wasm_bindgen_test;
use wasm_bindgen_test::*;


#[wasm_bindgen_test]
fn rectangle_test(){
  let r = Rectangle::new(0,0,10,10);
  assert_eq!(r.pointInBounds(5,5),true);
  assert_eq!(r.pointInBounds(10,10),true);
}


