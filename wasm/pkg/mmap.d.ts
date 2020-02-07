/* tslint:disable */
export enum FractalType {
  MANDELBROT,
  JULIA,
}
/**
*/
/**
*/
export class Mandelbrot {
  free(): void;
/**
* @param {number} max_i 
*/
  set_max_i(max_i: number): void;
/**
* @param {number} new_point_x 
* @param {number} new_point_y 
*/
  set_julia_point(new_point_x: number, new_point_y: number): void;
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
* @param {number} new_type 
*/
  set_fractal_type(new_type: number): void;
/**
* @param {number} width 
* @param {number} height 
* @param {number} pixel_size 
* @param {number} max_i 
* @param {number} centre_coords_x 
* @param {number} centre_coords_y 
* @param {number} julia_point_x 
* @param {number} julia_point_y 
* @param {number} fractal_type 
* @returns {Mandelbrot} 
*/
  static new(width: number, height: number, pixel_size: number, max_i: number, centre_coords_x: number, centre_coords_y: number, julia_point_x: number, julia_point_y: number, fractal_type: number): Mandelbrot;
/**
* @param {Uint8Array} new_arr 
*/
  set_arr(new_arr: Uint8Array): void;
/**
* @param {any} x_rect 
* @param {any} y_rect 
* @param {number} delta_x 
* @param {number} delta_y 
* @param {Uint8Array} old_arr 
* @param {number} start_row 
* @param {number} end_row 
* @param {number} width 
* @param {number} height 
* @param {number} centre_coords_x 
* @param {number} centre_coords_y 
* @returns {number} 
*/
  render_range(x_rect: any, y_rect: any, delta_x: number, delta_y: number, old_arr: Uint8Array, start_row: number, end_row: number, width: number, height: number, centre_coords_x: number, centre_coords_y: number): number;
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
