import React from 'react';
import './about.css';

export function About(props) {
  const [image, setImage] = React.useState('data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=');
  const [quote, setQuote] = React.useState('Loading...');
  const [author, setAuthor] = React.useState('unknown');

  // We only want this to render the first time the component is created and so we provide an empty dependency list.
  React.useEffect(() => {
    setImage(`logo.png`);
    setQuote('A computer would deserve to be called intelligent if it could deceive a human into believing that it was human.');
    setAuthor('Alan Turing');
  }, []);

  return (
    <main className='container-fluid bg-secondary text-center justify-content'>
      <div>
        <img src={image} alt='random image' />

        <p>
          Odd One Out is a game where a group tries to identify the outlier among them. 
          Each round, the group votes to remove a member. 
          The group then votes to continue the game.
          When the game ends, if the outlier has been caught, each remaining member wins, otherwise, everyone loses.
        </p>

        <div className='quote-box bg-light text-dark'>
          <p className='quote'>{quote}</p>
          <p className='author'>{author}</p>
        </div>
      </div>
    </main>
  );
}
