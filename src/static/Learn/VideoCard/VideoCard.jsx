import React from 'react';
import { Segment, Header } from 'semantic-ui-react';

// Using fast loading embed by found here
// https://css-tricks.com/lazy-load-embedded-youtube-videos/

function VideoCard(props) {
  const p = props;
  return (
    <Segment>
      <Header as="h4">
        {p.title}
      </Header>
      {p.description}
      <iframe
        style={{ width: '100%', height: '360px' }}
        src={`https://www.youtube.com/embed/${p.videoID}`}
        srcDoc={`<style>*{padding:0;margin:0;overflow:hidden}html,body{height:100%}img,span{position:absolute;width:100%;top:0;bottom:0;margin:auto}span{height:1.5em;text-align:center;font:48px/1.5 sans-serif;color:white;text-shadow:0 0 0.5em black}</style><a href=https://www.youtube.com/embed/${p.videoID}?autoplay=1><img src=https://img.youtube.com/vi/${p.videoID}/hqdefault.jpg alt='Video - ${p.title}'><span>▶</span></a>`}
        frameBorder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={p.title}
      />
    </Segment>
  );
}

export default VideoCard;
