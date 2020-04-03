# Mandelbrot Maps

Mandelbrot Maps is a fractal renderer build using React and WASM + Rust.

A development build can be found [here](mmaps.freddiejbawden.com) 

## Setting up and Running Locally

Navigate to the root directory of the project and run; 
`npm install`

To run call, this will start an instance of the site running on `localhost:3000`. 
`npm start`

## Testing 

We include a simple test that makes sure the page loads. This can be run using `npm run test`

We also include an automated testing suite, this can be run using `npm run performanceTest`. 

It can be configured in the command line or be changing the config file in `src/tests/performance`. Command line args are specified using defined using `npm run performanceTest -- engine="Chromium"` for example.

| Argument        | Purpose                                    | Value                          |
|-----------------|--------------------------------------------|--------------------------------|
| `device`        | Specify the Puppeteer device config to use | Puppeteer device config        |
| `engine`        | Specify which engine to use                | "Gecko" or "Chromium"          |
| `filename`      | File to output readings to                 | String                         |
| `iterations`    | Number of times to run at each level       | Integer                        |
| `numberOfSteps` | Number of zoom levels to test              | Integer                        |
| `stepsize`      | How far to zoom each time                  | Integer (magnification amount) |


