import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import { LobbyEvent, LobbyNotifier } from '../lobby/lobbyNotifier';
import { Player } from '../player';
import { GameState } from '../play/gameState';
import './authenticated.css';

export function Authenticated(props) {
  const navigate = useNavigate();

  function logout() {
    fetch(
      `api/auth/logout`,
      {
        method: 'delete',
      }
    ).catch(() => {
      console.log("Logout Failed")
    }).finally(() => {
      LobbyNotifier.broadcastEvent(props.id, null, LobbyEvent.End, null);
      localStorage.clear();
      props.onLogout();
    });
  };

  function play() {
    if (props.gameState && props.gameState !== GameState.Unknown) {
      navigate('/play');
    }
    else {
      props.onEnterLobby();
      navigate('/lobby');
    }
  };

  return (
    <div>
      <div className='playerName'>{props.username}</div>
      <Button variant='primary' onClick={() => play()}>
        Play
      </Button>
      <Button variant='secondary' onClick={() => logout()}>
        Logout
      </Button>
    </div>
  );
}
