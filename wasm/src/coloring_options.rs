use wasm_bindgen::prelude::*;

#[wasm_bindgen] 
#[derive(PartialEq, Clone, Copy)] 
pub enum ColorOptions {
  BLACKANDWHITE,
  RAINBOW,
  STRIPY,
}