import React from 'react';

import { Unauthenticated } from './unauthenticated';
import { Authenticated } from './authenticated';
import { AuthState } from './authState';

export function Login(props) {
  const [image, setImage] = React.useState(`logo.png`);

  return (
    <main className='container-fluid bg-secondary text-center'>
      <div>
        {props.authState !== AuthState.Unknown && (
          <div>
            <h1>Can You Spot the Odd One Out?</h1>
            <img src={image} alt="random" width="400px"/>
          </div>
        )}
      </div>
      <div>
        {props.authState === AuthState.Authenticated && (
          <Authenticated 
            username={props.username}
            id={props.id}
            token={props.token}
            gameState={props.gameState}
            onEnterLobby={props.onEnterLobby}
            onLogout={() => props.onAuthChange(props.username, props.id, props.token, AuthState.Unauthenticated)} 
          />
        )}
        {props.authState === AuthState.Unauthenticated && (
          <Unauthenticated
            username={props.username}
            id={props.id}
            onLogin={(newUsername, newId, newToken) => {
              props.onAuthChange(newUsername, newId, newToken, AuthState.Authenticated);
            }}
          />
        )}
      </div>
    </main>
  );
}
