/* tslint:disable */
/**
*/
export class Mandelbrot {
  free(): void;
/**
* @param {number} max_i 
*/
  set_max_i(max_i: number): void;
/**
* @param {number} width 
* @param {number} height 
*/
  set_width_height(width: number, height: number): void;
/**
* @param {number} fractal_limit_x 
* @param {number} fractal_limit_y 
*/
  set_limits(fractal_limit_x: number, fractal_limit_y: number): void;
/**
* @param {number} pixel_size 
*/
  set_pixel_size(pixel_size: number): void;
/**
* @param {number} width 
* @param {number} height 
* @param {number} pixel_size 
* @param {number} max_i 
* @param {number} centre_coords_x 
* @param {number} centre_coords_y 
* @returns {Mandelbrot} 
*/
  static new(width: number, height: number, pixel_size: number, max_i: number, centre_coords_x: number, centre_coords_y: number): Mandelbrot;
/**
* @param {number} pixel_num 
* @returns {number} 
*/
  escape_algorithm(pixel_num: number): number;
/**
* @param {number} pixel_size 
* @param {number} width 
* @param {number} height 
* @param {number} centre_coords_x 
* @param {number} centre_coords_y 
* @param {number} max_i 
*/
  update(pixel_size: number, width: number, height: number, centre_coords_x: number, centre_coords_y: number, max_i: number): void;
/**
* @param {number} pixel_size 
* @param {number} width 
* @param {number} height 
* @param {number} centre_coords_x 
* @param {number} centre_coords_y 
* @param {number} max_i 
* @returns {number} 
*/
  render(pixel_size: number, width: number, height: number, centre_coords_x: number, centre_coords_y: number, max_i: number): number;
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
  render_from_to(start: number, end: number, pixel_size: number, width: number, height: number, centre_coords_x: number, centre_coords_y: number, max_i: number): number;
}
