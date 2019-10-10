mod utils;

use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub struct Mandelbrot {
  width: i32,
  height: i32,
  fractal_limit_x: f32,
  fractal_limit_y: f32,
  pixel_size: f32,
  max_i: i32
}
impl Mandelbrot {
  fn pixels_to_coord(&self, pixel_num: i32) -> (f32,f32) {
    let (x,y) = &self.calculate_position(&pixel_num);
    let width = *&self.width as f32;
    let height = *&self.height as f32;
    let ratio = width/height;
    let coord_x = &self.fractal_limit_x + &self.pixel_size*x;
    let coord_y = &self.fractal_limit_y + &self.pixel_size*y/ratio;
    return (coord_x, coord_y);
  }
  fn calculate_position(&self, &pixel_num: &i32) -> (f32,f32) {
    let x = (pixel_num % &self.width) as f32;
    let y = (pixel_num/&self.height) as f32;
    return (x,y);
  }
  
}
#[wasm_bindgen]
impl Mandelbrot {
  pub fn greet() {
    alert("Hello, Mandelbrot!");
  }
  pub fn new(width: i32, height: i32, fractal_limit_x: f32, fractal_limit_y: f32,pixel_size: f32, max_i: i32) -> Mandelbrot {
    return Mandelbrot {
      width,
      height,
      fractal_limit_x,
      fractal_limit_y,
      pixel_size,
      max_i
    }
  }
  pub fn escape_algorithm(&self, pixel_num: i32) -> i32 {
    let (x_fractal, y_fractal) = &self.pixels_to_coord(pixel_num);
    let mut x: f32 = 0.0;
    let mut y: f32 = 0.0;
    let mut i : i32 = 0;
    while x*x + y*y < 4.0 && i < *&self.max_i {
      let xtemp = x*x - y*y + x_fractal;
      y = 2.0*x*y + y_fractal;
      x = xtemp;
      i+=1;
    }
    return i;
  }
  
}