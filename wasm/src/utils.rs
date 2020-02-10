pub fn set_panic_hook() {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function at least once during initialization, and then
    // we will get better error messages if our code ever panics.
    //
    // For more details see
    // https://github.com/rustwasm/console_error_panic_hook#readme
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

pub fn interpolate(start_n: u8, end_n: u8, t: f64) -> u8 {
  if t < 0.0 {
    return 255;
  }
  if t >= 1.0 {
    return end_n;
  }
  let start_n_f = start_n as f64;
  let end_n_f = end_n as f64;
  let res = (end_n_f - start_n_f) * t + start_n_f;
  // check for int wrap around
  if res > 255.0 {
    return 255;
  } 
  return res as u8;

  

}