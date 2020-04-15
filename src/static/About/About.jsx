import React from 'react';
import { Header } from 'semantic-ui-react';
import '../pagebase.css';
import createPage from '../Page/Page';

function About() {
  return (
    <div>
      <Header as="h1">About</Header>
      <p>
        Mandelbrot Maps is an interactive fractal viewer allowing users
        {' '}
        to explore the relationship between the Julia and Mandelbrot sets. It was build by
        {' '}
        <a href="www.freddiejbawden.com">Freddie Bawden</a>
        {' '}
      under the supervision of
        {' '}
        <a href="http://homepages.inf.ed.ac.uk/wadler/">Philip Walder</a>
        {' '}
      for a university project.
      </p>
      <p>
        <a href="https://jmaio.github.io/Joao Maio">Joao Maio</a>
        {' '}
        developed a similar project in parallel using WebGL as the render engine. Their
        {' '}
        application is super fast and looks beautiful,
        {' '}
        <a href="https://jmaio.github.io/mandelbrot-maps/">check it out!</a>
      </p>

      <p>
        Android users can also try the
        {' '}
        <a href="https://play.google.com/store/apps/details?id=uk.ac.ed.inf.mandelbrotmaps&hl=en_GB">Mandelbrot Maps App</a>
        {' '}
        created a few years ago.
      </p>
      <img style={{ width: '100%' }} alt="Mandelbrot Fractal" src="fractal.png" />
    </div>
  );
}

export default createPage(About);
