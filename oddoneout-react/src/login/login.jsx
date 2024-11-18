import React from 'react';

import { Unauthenticated } from './unauthenticated';
import { Authenticated } from './authenticated';
import { AuthState } from './authState';

export function Login({ username, authState, onAuthChange }) {
  const [image, setImage] = React.useState(`logo.png`);
  return (
    <main className='container-fluid bg-secondary text-center'>
      <div>
        {authState !== AuthState.Unknown && (
          <div>
            <h1>Can You Spot the Odd One Out?</h1>
            <img src={image} alt="random" width="400px"/>
          </div>
        )}
      </div>
      <div>
        {authState === AuthState.Authenticated && (
          <Authenticated 
            username={username} 
            onLogout={() => onAuthChange(username, AuthState.Unauthenticated)} 
          />
        )}
        {authState === AuthState.Unauthenticated && (
          <Unauthenticated
            username={username}
            onLogin={(loginUsername) => {
              onAuthChange(loginUsername, AuthState.Authenticated);
            }}
          />
        )}
      </div>
    </main>
  );
}