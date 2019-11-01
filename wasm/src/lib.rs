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
extern "C" {
    // Use `js_namespace` here to bind `console.log(..)` instead of just
    // `log(..)`
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    // The `console.log` is quite polymorphic, so we can bind it with multiple
    // signatures. Note that we need to use `js_name` to ensure we always call
    // `log` in JS.
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_u32(a: u32);
}
#[wasm_bindgen]
pub struct Mandelbrot {
  width: u32,
  height: u32,
  fractal_limit_x: f32,
  fractal_limit_y: f32,
  pixel_size: f32,
  max_i: u32,
  centre_coords: (f32, f32),
  arr: Vec<u8>,
}
impl Mandelbrot {
  fn pixels_to_coord(&self, pixel_num: u32) -> (f32,f32) {
    let (x,y) = &self.calculate_position(&pixel_num);
    let width = *&self.width as f32;
    let height = *&self.height as f32;
    let ratio = width/height;
    let coord_x = &self.fractal_limit_x + &self.pixel_size*x;
    let coord_y = &self.fractal_limit_y + &self.pixel_size*y/ratio;
    return (coord_x, coord_y);
  }
  fn calculate_position(&self, &pixel_num: &u32) -> (f32,f32) {
    let x = (pixel_num % &self.width) as f32;
    let y = (pixel_num/&self.height) as f32;
    return (x,y);
  }
  
}

#[wasm_bindgen]
impl Mandelbrot {
  pub fn set_max_i(&mut self, max_i: u32) {
    self.max_i = max_i;
  }
  pub fn set_width_height(&mut self, width: u32, height: u32) {
    self.width = width;
    self.height = height
  }
  pub fn set_limits(&mut self, fractal_limit_x: f32, fractal_limit_y: f32) {
   self.fractal_limit_x = fractal_limit_x;
   self.fractal_limit_y = fractal_limit_y;
  }
  pub fn set_pixel_size(&mut self, pixel_size: f32) {
    self.pixel_size = pixel_size;
  }

  pub fn new(width: u32, height: u32,pixel_size: f32, max_i: u32, centre_coords_x: f32, centre_coords_y: f32) -> Mandelbrot {
    let centre_coords = (centre_coords_x, centre_coords_y);
    let fractal_limit_x = 0.0;
    let fractal_limit_y = 0.0;
    let len = (width*height*4) as usize;
    let arr = Vec::new();
    return Mandelbrot {
      width,
      height,
      fractal_limit_x,
      fractal_limit_y,
      pixel_size,
      max_i,
      centre_coords,
      arr
    }
  }
  pub fn escape_algorithm(&self, pixel_num: u32) -> u32 {
    let (x_fractal, y_fractal) = &self.pixels_to_coord(pixel_num);

    let mut x: f32 = 0.0;
    let mut y: f32 = 0.0;
    let mut i : u32 = 0;
    while x*x + y*y < 4.0 && i < *&self.max_i {
      let xtemp = x*x - y*y + x_fractal;
      y = 2.0*x*y + y_fractal;
      x = xtemp;
      i+=1;
    }
    return i;
  }
  
  pub fn render(&mut self) -> *const u8 {
    self.arr = Vec::new();
    let w = *&self.width as f32;
    let h = *&self.height as f32;
    self.fractal_limit_x = self.centre_coords.0 - (w/2.0)*self.pixel_size;
    self.fractal_limit_y = self.centre_coords.1 - (h/2.0)*self.pixel_size;
    let _color_scale = 255.0/(self.max_i as f32);
    for i in 0..(self.width*self.height) {
      let iter = ((self.escape_algorithm(i) as f32) * _color_scale) as u8;
      self.arr.push(iter);
      self.arr.push(iter);
      self.arr.push(iter);
      self.arr.push(255);
    }
    return self.arr.as_ptr();
  }
  pub fn render_from_to(&mut self, start: u32, end: u32) -> *const u8 {
    self.arr = Vec::new();
    let w = *&self.width as f32;
    let h = *&self.height as f32;
    self.fractal_limit_x = self.centre_coords.0 - (w/2.0)*self.pixel_size;
    self.fractal_limit_y = self.centre_coords.1 - (h/2.0)*self.pixel_size;
    let _color_scale = 255.0/(self.max_i as f32);
    for i in 0..(end-start) {
      let iter = ((self.escape_algorithm(i+start) as f32) * _color_scale) as u8;
      self.arr.push(iter);
      self.arr.push(iter);
      self.arr.push(iter);
      self.arr.push(255);
    }
    return self.arr.as_ptr();
  }
  
}