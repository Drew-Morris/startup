import React from 'react';
import { useNavigate } from 'react-router-dom'
import { MutatingDots } from 'react-loader-spinner';
import { LobbyEvent, LobbyNotifier } from './lobbyNotifier.js';
import { Timer } from '../timer';
import { Tag } from '../tag';
import { Player } from '../player'
import './lobby.css';

const timer = new Timer();

export function Lobby(props) {
  const [image, setImage] = React.useState(`logo.png`);
  const [connectionMessage, setConnectionMessage] = React.useState('Establishing Connection');
  const navigate = useNavigate();

  React.useEffect(() => {
    setImage(`logo.png`);
  }, []);

  React.useEffect(() => {
    LobbyNotifier.addHandler(handleLobbyEvent);
    return () => {
      LobbyNotifier.removeHandler(handleLobbyEvent);
    }
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (props.size >= props.capacity && !timer.on) {
        timer.set(props.totalTime);
        timer.begin();
      }
      if (timer.on) {
        const now = timer.now();
        setConnectionMessage(`Game Commencing In ${now}`);
        props.onUpdateTime((prev) => now);
        if (now === 0) {
          connect();
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [props.time, props.startTime, props.size, props.capacity, props.onUpdateTime]);

  async function handleLobbyEvent(event) {
    if (event.type === LobbyEvent.Start) {
      props.onAddPlayer(event.value);
    }
    else if (event.type === LobbyEvent.End) {
      props.onRemovePlayer(event.value.id);
    }
  }

  async function connect() {
    props.onConnect();
    navigate('/play');
  }

  return (
    <main className='container-fluid bg-secondary text-center justify-content'>
      <div className='message-container'>
        <h1>{connectionMessage}</h1>
        <h3>{props.size + 1} / 5 Players</h3>
      </div>
      <div className='image-container'>
        <img className='logo' src={image} alt='random image' />
        <MutatingDots
          visible={true}
          height="100"
          width="100"
          color="#fc054b"
          secondaryColor="#2de2e6"
          radius="12.5"
          ariaLabel="mutating-dots-loading"
          wrapperClass="load"
        />
      </div>
      <Tag username={props.username} />
    </main>
  );
}
