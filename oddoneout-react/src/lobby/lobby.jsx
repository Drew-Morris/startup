import React from 'react';
import './lobby.css';

export function Lobby(props) {
  const [image, setImage] = React.useState(`logo.png`);
  React.useEffect(() => {
    setImage(`logo.png`);
  }, []);
  return (
    <main className='container-fluid bg-secondary text-center justify-content'>
      <div>
        <img src={image} alt='random image' />
        <p>Loading...</p>
      </div>
    </main>
  );
}
