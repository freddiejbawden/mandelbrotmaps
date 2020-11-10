# Mandelbrot Maps

Mandelbrot Maps is a fractal renderer build using React and WASM + Rust for my final year project. It was developed over a year under the supervision of [Philip Wadler](http://homepages.inf.ed.ac.uk/wadler/).

A development build can be found [here](https://mandelbrot-maps.herokuapp.com/), note it may take some time to load first time as the Heroku server powering it takes some time to spin up on the free tier! 

## Setting up and Running Locally

Navigate to the root directory of the project and run; 
`npm install`

To run call, this will start an instance of the site running on `localhost:3000`. 
`npm start`

## Dissertation Abstract

>First created by Iain Parris in 2009, the Mandelbrot Maps project aimed to create a browser-based real-time fractal viewer. Since then, others have ported the application to Android to provide an experience for touch devices. Today, most browsers support touch directly --- by rebuilding the application for the modern web, it can support touch and desktop devices without the need to maintain separate applications for each target. 

>The application was rebuilt using Javascript and WebAssembly to create a responsive cross-device application which is usable on desktop and mobile devices. The application supports a user interface that allows for intuitive control through multiple input sources and a renderer which uses web workers to parallelize the workload. The renderer is able to draw fractals magnified 10,000,000 times in under a second on popular browsers. A user experience survey based on the System Usability Scale showed our system exceeded the industry standard: it scored 77.8 out of 100, where a rating of 70 or higher is considered acceptable. The survey also demonstrated that our user interface is accessible and easy to learn regardless of the user's mathematical background. These results show that the new version of Mandelbrot Maps is a successful update of the original project. 

