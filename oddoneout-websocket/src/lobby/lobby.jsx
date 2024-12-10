import React from 'react';
import { useNavigate } from 'react-router-dom'
import { MutatingDots } from 'react-loader-spinner';
import Stack from '@mui/material/Stack';
import Button from 'react-bootstrap/Button';
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
    let mounted = true;
    LobbyNotifier.addHandler((event) => {
      if (mounted) {
        handleLobbyEvent(event);
      }
    });
    return () => {
      LobbyNotifier.removeHandler(handleLobbyEvent);
      mounted = false;
    }
  }, [props.lobby]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (props.size >= props.capacity && !timer.on) {
        timer.set(props.totalTime);
        timer.start();
      }
      if (timer.on) {
        const now = timer.now();
        setConnectionMessage(`Game Commencing In ${now}`);
        props.onUpdateTime((prev) => now);
        if (now === 0) {
          timer.stop();
          timer.reset();
          connect();
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [props.time, props.totalTime, props.size, props.capacity, props.onUpdateTime, props.onConnect, timer]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (props.size === 0) {
        LobbyNotifier.broadcastEvent(
          props.id, 
          null, 
          LobbyEvent.Start, 
          null,
        );
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [props.id, props.lobby, props.size, props.capacity, props.players]);


  async function handleLobbyEvent(event) {
    if (event.from !== props.id) {
      if (event.type === LobbyEvent.Start && props.size < props.capacity) {
        props.onStartLobby(event.from, props.lobby);
      }
      else if (event.type === LobbyEvent.End) {
        props.onRemovePlayer(event.from);
      }
      else if (event.type === LobbyEvent.Join && event.to && event.to === props.id) {
        if (props.size < props.capacity) {
          props.onJoinLobby(event.value.lobby, event.from, event.value.player);
        }
        else {
          LobbyNotifier.broadcastEvent(props.id, event.from, LobbyEvent.Reject, null);
        }
      }
      else if (event.type === LobbyEvent.Accept && event.to && event.to === props.id) {
        props.onAddPlayer(event.value);
      }
      else if (event.type === LobbyEvent.Reject &&  event.to && event.to === props.id) {
        // Do Nothing
      }
    }
  };

  async function connect() {
    props.onConnect();
    navigate('/play');
  }

  async function disconnect() {
    LobbyNotifier.broadcastEvent(
      props.username, 
      null,
      LobbyEvent.End, 
      null
    );
    props.onDisconnect();
    navigate('/login');
  };


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
      <div>
        <Stack 
          direction="row" 
          width="100%" 
          sx={{ 
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1em',
          }}
          spacing={2}
        >
          <Button id='quit' className='btn btn-danger' onClick={() => disconnect()}>Quit</Button>
        </Stack>
        <Tag username={props.username}/>
      </div>
    </main>
  );
}
