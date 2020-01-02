use wasm_bindgen::prelude::*;

#[wasm_bindgen] 
#[derive(PartialEq)] 
pub enum FractalType {
  MANDELBROT,
  JULIA,
}