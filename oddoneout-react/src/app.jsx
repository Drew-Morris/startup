import React from 'react';
import { BrowserRouter, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { Login } from './login/login';
import { Lobby } from './lobby/lobby';
import { Play } from './play/play';
import { Stats } from './stats/stats';
import { About } from './about/about';
import { AuthState } from './login/authState';
import { GameState } from './play/gameState';
import { Player } from './player';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

function randomChoice(array) {
  return [...array][Math.floor(Math.random() * [...array].length)];
};

function countVotes(votes) {
  let count = 0;
  [...votes].forEach((vote) => {count += vote ? 1 : -1});
  return count;
};

function initAnswers(players) {
  const newAnswers = new Map();
  [...players].forEach((player) => {
    if (player.active) {
      newAnswers.set(player.id, '');
    }
  });
  return newAnswers;
};

function initBallots(players) {
  const newBallots = new Map();
  [...players].forEach((player) => {
    if (player.active) {
      newBallots.set(player.id, []);
    }
  });
  return newBallots;
};

function countBallots(ballots) {
  const map = new Map();
  [...ballots].forEach((t) => {
    [...t[1]].forEach((id) => {
      if (map.has(id)) {
        map.set(id, map.get(id) + 1);
      }
      else {
        map.set(id, 1);
      }
    });
  });
  let maxIds = [];
  let maxNum = 0;
  map.forEach((num, id) => {
    if (maxIds.length === 0) {
      maxIds.push(id);
      maxNum = num;
    }
    else if (num === maxNum) {
      maxIds.push(id);
    }
    else if (num > maxNum) {
      maxIds = [id];
      maxNum = num;
    }
  });
  return randomChoice(maxIds);
};

function App() {
  const [username, setUsername] = React.useState(localStorage.getItem('username') || '');
  const [id, setId] = React.useState(localStorage.getItem('id') || '');

  const currentAuthState = username ? AuthState.Authenticated : AuthState.Unauthenticated;
  const [authState, setAuthState] = React.useState(currentAuthState);
  const localGameState = localStorage.getItem('gameState');
  const currentGameState = authState === AuthState.Unauthenticated ? null : localGameState ? JSON.parse(localGameState) : null;
  const [gameState, setGameState] = React.useState(currentGameState);

  const localPlayers = localStorage.getItem('players');
  const [players, setPlayers] = React.useState(localPlayers ? JSON.parse(localPlayers) : []);
  const localQuestions = localStorage.getItem('questions');
  const [questions, setQuestions] = React.useState(localQuestions ? JSON.parse(localQuestions) : []);
  const localAnswers = localStorage.getItem('answers');
  const [answers, setAnswers] = React.useState(localAnswers ? new Map(Object.Entries(JSON.parse(localAnswers))) : new Map());
  const localBallots = localStorage.getItem('ballots');
  const [ballots, setBallots] = React.useState(localBallots ? new Map(Object.Entries(JSON.parse(localBallots))) : new Map());
  const [kickId, setKickId] = React.useState(localStorage.getItem('kickId') || '');
  const [kickAnswer, setKickAnswer] = React.useState(localStorage.getItem('kickAnswer') || '');
  const localVotes = localStorage.getItem('votes');
  const [votes, setVotes] = React.useState(localVotes ? JSON.parse(localVotes) : []);
  const [botId, setBotId] = React.useState(localStorage.getItem('botId') || '');
  
  const initGamePrompt = 'Ask A Question';
  const [gamePrompt, setGamePrompt] = React.useState(localStorage.getItem('gamePrompt') || initGamePrompt);
  const [active, setActive] = React.useState(id && id.length > 0);
  const [sent, setSent] = React.useState(false);
  const [quit, setQuit] = React.useState(false);
  const [kicked, setKicked] = React.useState(false);

  const initGameTime = 30;
  const initLobbyTime = 5;
  const [gameTime, setGameTime] = React.useState(initGameTime);
  const [lobbyTime, setLobbyTime] = React.useState(initLobbyTime);
  const lobbyCapacity = 4;

  React.useEffect(() => {
    if (authState === AuthState.Authenticated) {
      localStorage.setItem('players', JSON.stringify(players));
    }
  }, [players, authState]);

  React.useEffect(() => {
    if (authState === AuthState.Unauthenticated) {
      localStorage.removeItem('players');
    }
  }, [authState]);

  function clear() {
    setUsername('');
    setId('');
    setBotId('');
    setAuthState(AuthState.Unauthenticated);
    setGameState(null);
    setPlayers([]);
    setQuestions([]);
    setAnswers(new Map());
    setBallots(new Map());
    setKickId('');
    setKickAnswer('');
    setVotes([]);
    setGamePrompt(initGamePrompt);
    setActive(false);
    setSent(false);
    setQuit(false);
    setKicked(false);
    setGameTime(initGameTime);
    setLobbyTime(initLobbyTime);
    localStorage.clear();
  };

  function connectBot() {
    console.log("TODO: MAKE BOT");
    setBotId('BOT');
    return new Player("BOT", "BOT");
  };
 
  async function onConnect() {
    setActive(true);
    setSent(false);
    setPlayers(prev => {
      const newPlayers = [...prev, connectBot()];
      const myPlayer = new Player(id, username);
      setAnswers(initAnswers([...newPlayers, myPlayer]));
      setBallots(initBallots([...newPlayers, myPlayer]));
      return newPlayers;
    });
    setGameState(GameState.Question);
    setGamePrompt(initGamePrompt);
  };

  async function addPlayer(player) {
    setPlayers(prev => {
      if (prev.length < lobbyCapacity) {
        const newPlayers = [...prev, player];
        return newPlayers;
      }
      else {
        return prev;
      }
    });
  };

  async function removePlayer(playerId) {
    setPlayers(prev => {
      if (prev.length > 0) {
        const newPlayers = prev.filter((p) => p.id !== playerId);
        return newPlayers;
      }
      else {
        return prev;
      }
    });
  };

  async function onSubmitQuestion(myQuestion) {
    if (active && !sent) {
      setSent(true);
      onReceiveQuestion(myQuestion);
      console.log("TODO: SUBMIT QUESTION");
    }
  };

  async function onReceiveQuestion(newQuestion) {
    if (!questions.includes(newQuestion)) {
      setQuestions((prev) => [...prev, newQuestion]);
    }
  };

  async function onSubmitAnswer(myAnswer) {
    if (active && !sent) {
      setSent(true);
      onReceiveAnswer(id, myAnswer);
      console.log("TODO: SUBMIT ANSWER");
    }
  };

  async function onReceiveAnswer(playerId, newAnswer) {
    setAnswers((prev) => {
      if (prev.has(playerId)) {
        const newAnswers = new Map(prev);
        newAnswers.set(playerId, newAnswer);
        return newAnswers;
      }
      else {
        return prev;
      }
    });
  };

  async function onSubmitBallot(myBallot) {
    if (active && !sent) {
      setSent(true);
      onReceiveBallot(id, myBallot);
      console.log("TODO: SUBMIT BALLOT");
    }
  };
  
  async function onReceiveBallot(playerId, newBallot) {
    setBallots((prev) => {
      if (prev.has(playerId)) {
        const newBallots = new Map(prev);
        newBallots.set(playerId, newBallot);
        return newBallots;
      }
      else {
        return prev;
      }
    });
  };

  async function onSubmitVote(myVote) {
    if (active && !sent) {
      setSent(true);
      onReceiveVote(myVote);
      console.log("TODO: SUBMIT VOTE");
    }
  };

  async function onReceiveVote(newVote) {
    setVotes((prev) => [...prev, newVote]);
  };

  async function onQuit() {
    if (gameState !== GameState.Results) {
      setQuit(true);
      console.log("TODO: QUIT");
    }
    onGameEnd();
  };
  
  async function onGameEnd() {
    sendStats();
    setGameState(null);
    setGamePrompt(initGamePrompt);
    setQuestions([]);
    setAnswers(new Map());
    setBallots(new Map());
    setVotes([]);
    setKickId('');
    setBotId('');
    setKickAnswer('');
    setActive(false);
    setSent(false);
    setKicked(false);
    setQuit(false);
    setId('');
    setPlayers([]);
  };

  async function sendStats() {
    console.log("TODO: SEND STATS");
  };
  
  async function onAuthChange(newUsername, newId, newAuthState) {
    setUsername(newUsername);
    setId(newId);
    setAuthState(newAuthState);
    if (newAuthState === newAuthState.Unauthenticated) {
      clear();
    }
  };

  async function onNextGame() {
    setSent(false);
    if (gameState === GameState.Question) {
      setGamePrompt(randomChoice(questions));
      setQuestions([]);
      setGameState(GameState.Answer);
    }
    else if (gameState === GameState.Answer) {
      setGameState(GameState.Ballot);
    }
    else if (gameState === GameState.Ballot) {
      const newKickId = countBallots(ballots);
      const newKickAnswer = answers.get(newKickId);
      const myPlayer = new Player(id, username, newKickId === id);
      const newPlayers = [];
      if (newKickId === id) {
        setActive(false);
        player.forEach((player) => newPlayers.push(player));
      }
      else {
        players.forEach((player) => {
          if (player.id === newKickId) {
            player.active = false;
          }
          newPlayers.push(player);
        });
        setPlayers(newPlayers);
      }
      setKickId(newKickId);
      setKickAnswer(newKickAnswer);
      setAnswers(initAnswers([...newPlayers, myPlayer]));
      setBallots(initBallots([...newPlayers, myPlayer]));
      setGamePrompt('');
      setGameState(GameState.Kick);
    }
    else if (gameState === GameState.Kick) {
      setGamePrompt('Has The Bot Been Found?');
      setKickId('');
      setKickAnswer('');
      setGameState(GameState.Vote);
    }
    else if (gameState === GameState.Vote) {
      if (countVotes(votes) < 0) {
        setGamePrompt(initGamePrompt);
        setGameState(GameState.Question);
      }
      else {
        setGamePrompt('Results');
        setGameState(GameState.Results);
      }
      setVotes([]);
    }
  };

  return (
    <BrowserRouter>
      <div className='body bg-dark text-light'>
        <header className='container-fluid'>
          <nav className='navbar fixed-top navbar-dark'>
            <div className='navbar-brand'>
              Odd One Out
            </div>
            <menu className='navbar-nav'>
              <li className='nav-item'>
                <NavLink className='nav-link' to='login'>
                  Home
                </NavLink>
              </li>
              {authState === AuthState.Authenticated && (
                <li className='nav-item'>
                  <NavLink className='nav-link' to={gameState ? '/play' : '/lobby'}>
                    Play
                  </NavLink>
                </li>
              )}
              {authState === AuthState.Authenticated && (
                <li className='nav-item'>
                  <NavLink className='nav-link' to='stats'>
                    Stats
                  </NavLink>
                </li>
              )}
              <li className='nav-item'>
                <NavLink className='nav-link' to='about'>
                  About
                </NavLink>
              </li>
            </menu>
          </nav>
        </header>

        <Routes>
          <Route
            path='/login'
            element={
              <Login
                username={username}
                authState={authState}
                onAuthChange={onAuthChange}
              />
            }
            exact
          />
          <Route
            path='/lobby' 
            element={
              <Lobby 
                username={username} 
                totalTime={initLobbyTime}
                time={lobbyTime}
                capacity={lobbyCapacity}
                size={players.length}
                onUpdateTime={setLobbyTime}
                onAddPlayer={addPlayer}
                onRemovePlayer={(player) => setPlayers(players.filter((p) => p !== player))}
                onConnect={onConnect}
              />
            } 
          />
          <Route 
            path='/play' 
            element={
              <Play
                username={username} 
                players={players}
                answers={answers}
                kickId={kickId}
                kickAnswer={kickAnswer}
                totalTime={initGameTime}
                time={gameTime}
                gamePrompt={gamePrompt}
                active={active}
                sent={sent}
                state={gameState}
                onUpdateTime={setGameTime}
                onSubmitQuestion={onSubmitQuestion}
                onSubmitAnswer={onSubmitAnswer}
                onSubmitBallot={onSubmitBallot}
                onSubmitVote={onSubmitVote}
                onReceiveQuestion={onReceiveQuestion}
                onReceiveAnswer={onReceiveAnswer}
                onReceiveBallot={onReceiveBallot}
                onReceiveVote={onReceiveVote}
                onQuit={onQuit}
                onNextGame={onNextGame}
                onEnd={onGameEnd}
              />
            } 
          />
          <Route 
            path='/stats' 
            element={
              <Stats 
                username={username} 
              />
            } 
          />
          <Route 
            path='/about' 
            element={
              <About />
            } 
          />
          <Route
            path='/'
            element={
              <Login
                username={username}
                authState={authState}
                onAuthChange={(newUsername, newAuthState) => {
                  setAuthState(newAuthState);
                  setUsername(newUsername);
                }}
              />
            }
            exact
          />
          <Route path='*' element={<NotFound />} />
        </Routes>

        <footer className='bg-dark text-dark text-muted'>
          <div className='container-fluid'>
            <span className='text-reset'>Drew Morris</span>
            <a className='text-reset' href='https://github.com/Drew-Morris/startup'>
              Source
            </a>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

function NotFound() {
  return <main className='container-fluid bg-secondary text-center'>404: Return to sender. Address unknown.</main>;
}

export default App;
