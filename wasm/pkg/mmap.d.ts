/* tslint:disable */
/**
*/
export class Mandelbrot {
  free(): void;
/**
*/
  static greet(): void;
/**
* @param {number} width 
* @param {number} height 
* @param {number} fractal_limit_x 
* @param {number} fractal_limit_y 
* @param {number} pixel_size 
* @param {number} max_i 
* @returns {Mandelbrot} 
*/
  static new(width: number, height: number, fractal_limit_x: number, fractal_limit_y: number, pixel_size: number, max_i: number): Mandelbrot;
/**
* @param {number} pixel_num 
* @returns {number} 
*/
  escape_algorithm(pixel_num: number): number;
}
