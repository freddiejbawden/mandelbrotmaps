use wasm_bindgen::prelude::*;

#[wasm_bindgen] 
#[derive(PartialEq)] 
pub enum ShadingOption {
  NONE,
  FULL,
}