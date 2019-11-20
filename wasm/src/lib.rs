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
    fn log_u32(a: i32);
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_i32(a: i32);

    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_f32(a: f32);

    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_u8(a: u8);
}
#[wasm_bindgen(raw_module = "./../../src/utils/Rectangle.js")]
pub extern "C" {
    pub type Rectangle;

    #[wasm_bindgen(constructor)]
    fn new(l: i32, t: i32, w: i32, h: i32) -> Rectangle;

    #[wasm_bindgen(method)]
    fn pointInBounds(this: &Rectangle, x: i32, y: i32) -> bool;

    #[wasm_bindgen(method)]
    fn getLeft(this: &Rectangle) -> i32;

    #[wasm_bindgen(method)]
    fn getTop(this: &Rectangle) -> i32;

    #[wasm_bindgen(method)]
    fn getWidth(this: &Rectangle) -> i32;

    #[wasm_bindgen(method)]
    fn getHeight(this: &Rectangle) -> i32;

}

#[wasm_bindgen]
pub struct Mandelbrot {
  width: i32,
  height: i32,
  fractal_limit_x: f32,
  fractal_limit_y: f32,
  pixel_size: f32,
  max_i: i32,
  centre_coords: (f32, f32),
  arr: Vec<u8>,
}
impl Mandelbrot {
  fn pixels_to_coord(&self, pixel_num: i32) -> (f32,f32) {
    let (x,y) = &self.calculate_position(&pixel_num);
    let coord_x = &self.fractal_limit_x + &self.pixel_size*x;
    let coord_y = &self.fractal_limit_y + &self.pixel_size*y;
    return (coord_x, coord_y);
  }
  fn calculate_position(&self, &pixel_num: &i32) -> (f32,f32) {
    let x = (pixel_num % &self.width) as f32;
    let y = (pixel_num/&self.width) as f32;
    return (x,y);
  }
  fn render_row(&self, y : i32, x_start : i32, x_end : i32) -> Vec<u8> {
    let mut row = Vec::new();
    let _color_scale = 255.0 / (self.max_i as f32);
    for x in x_start..x_end {
      let pixel_num = self.calculate_pixel_num(x,y);
      let iter = ((self.escape_algorithm(pixel_num) as f32)*_color_scale) as u8;
      row.push(iter);
      row.push(iter);
      row.push(iter);
      row.push(255);
    }
    return row;
  }
  fn calculate_pixel_num(&self, x: i32, y: i32) -> i32 {
    return y*self.width + x;
  }
}

#[wasm_bindgen]
impl Mandelbrot {
  pub fn set_max_i(&mut self, max_i: i32) {
    self.max_i = max_i;
  }
  pub fn set_width_height(&mut self, width: i32, height: i32) {
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

  pub fn new(width: i32, height: i32,pixel_size: f32, max_i: i32, centre_coords_x: f32, centre_coords_y: f32) -> Mandelbrot {
    utils::set_panic_hook();
    let centre_coords = (centre_coords_x, centre_coords_y);
    let fractal_limit_x = 0.0;
    let fractal_limit_y = 0.0;
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
  pub fn set_arr(&mut self, new_arr : Vec<u8>) {
    log_u8(new_arr[0]);
    self.arr = new_arr.to_vec();
  }
  pub fn render_range(&mut self,x_rect: Rectangle, y_rect: Rectangle, delta_x: i32, delta_y: i32, old_arr: Vec<u8>, start_row: i32, end_row: i32, width: i32, height: i32,centre_coords_x: f32, centre_coords_y: f32) -> *const u8 {
    self.update(self.pixel_size, width, height, centre_coords_x, centre_coords_y, self.max_i);
    let w = *&self.width as f32;
    let h = *&self.height as f32;
    self.fractal_limit_x = self.centre_coords.0 - (w/2.0)*self.pixel_size;
    self.fractal_limit_y = self.centre_coords.1 - (h/2.0)*self.pixel_size;
    let mut new_arr = Vec::new();
    let x_start;
    let x_end;
    if delta_x > 0 {
      x_start = x_rect.getLeft() + x_rect.getWidth();
      x_end = self.width as i32;
    } else {
      x_start = 0;
      x_end = (self.width as i32) - x_rect.getWidth();
    }
    for y in start_row..end_row {
      if y >= y_rect.getTop() && y <= (y_rect.getTop() + y_rect.getHeight()) {
        let row = self.render_row(y, 0, self.width);
        new_arr.extend(&row);
      } else {
        // compute re rendered slice 
        let mut re_rendered = self.render_row(y, x_rect.getLeft(), x_rect.getLeft() + x_rect.getWidth());
        let y_offset = (y - delta_y) * (self.width as i32);
        let old_arr_start = ((y_offset + (x_start - delta_x)) * 4) as usize;
        let old_arr_end = ((y_offset + (x_end - delta_x)) * 4) as usize;
        let old_arr_slice = &old_arr[old_arr_start..old_arr_end];
        if x_rect.getLeft() == 0 {
          // put the re rendered portion first;
          new_arr.append(&mut re_rendered);
          new_arr.extend_from_slice(old_arr_slice);
        } else {
          new_arr.extend_from_slice(old_arr_slice);
          new_arr.append(&mut re_rendered);
        }
      }
    }
   
    self.arr = new_arr.to_vec();
    return self.arr.as_ptr();
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
  pub fn update(&mut self, pixel_size: f32, width: i32, height: i32, centre_coords_x: f32, centre_coords_y: f32, max_i: i32)  {
    self.pixel_size = pixel_size;
    self.width = width;
    self.height = height;
    self.max_i = max_i;
    self.centre_coords =  (centre_coords_x, centre_coords_y);
  }
  pub fn render(&mut self, pixel_size: f32, width: i32, height: i32, centre_coords_x: f32, centre_coords_y: f32, max_i: i32) -> *const u8 {
    self.update(pixel_size, width, height, centre_coords_x, centre_coords_y, max_i);
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
  pub fn render_from_to(&mut self, start: i32, end: i32, pixel_size: f32, width: i32, height: i32, centre_coords_x: f32, centre_coords_y: f32, max_i: i32 ) -> *const u8 {
    self.update(pixel_size, width, height, centre_coords_x, centre_coords_y, max_i);
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