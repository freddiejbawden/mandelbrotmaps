import React from 'react';
import { Header } from 'semantic-ui-react';

import '../pagebase.css';
import NavBar from '../NavBar/NavBar';
import VideoCard from './VideoCard/VideoCard';

function Learn() {
  return (
    <div>
      <NavBar />
      <div className="about-wrapper">
        <div className="about-container">
          <Header as="h1">Learn</Header>
          <p>
            <strong>
              This page will contain information about the fractals and how they are formed
            </strong>
          </p>
          <Header>Mandelbrot And Julia Sets</Header>
          <p><strong>Will dump Mathematical Background section here</strong></p>
          <Header>Additonal Resources</Header>
          <p>
Many great videos have been published discussing the Mandelbrot and Julia set,
            during my research I watched quite a few of them! Below is a collection of resources
             which I found useful in my understanding of the subject
          </p>
          <VideoCard
            title="What's so special about the Mandelbrot Set? - Numberphile"
            description={(
              <p>
                <a href="https://www.bensparks.co.uk">Ben Sparks</a>
                {' '}
in collaboration with
                {' '}
                <a href="https://www.youtube.com/user/numberphile">Numberphile</a>
                {' '}
provides a great graphical explanation of the fractals
              </p>
              )}
            videoID="FFftmWSzgmk"
          />
          <VideoCard
            title="The dark side of the Mandelbrot set"
            description={(
              <p>
                <a href="https://www.youtube.com/channel/UC1_uAIS3r8Vu6JjXWvastJg">Mathologer</a>
                {' '}
has several videos on the Mandebrot set,
however this one gives a unique insight into what the interior of the bulbs look like
              </p>
)}
            videoID="9gk_8mQuerg"
          />
          <VideoCard
            title="Fibonacci Numbers hidden in the Mandelbrot Set - Numberphile"
            description={(
              <p>
                <a href="https://twitter.com/hollykrieger">Dr Holly Krieger</a>
                {' '}
in collaboration with
                {' '}
                <a href="https://www.youtube.com/user/numberphile">Numberphile</a>
                {' '}
discusses an intruiguing appearence of the fibonacci sequence in the Mandelbrot Set
              </p>
)}
            videoID="4LQvjSf6SSw"
          />
        </div>
      </div>
    </div>
  );
}

export default Learn;
