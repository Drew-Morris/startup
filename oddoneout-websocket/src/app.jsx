import React from 'react';
import { BrowserRouter, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { v4 } from 'uuid';
import { Login } from './login/login';
import { Lobby } from './lobby/lobby';
import { Play } from './play/play';
import { Stats } from './stats/stats';
import { About } from './about/about';
import { AuthState } from './login/authState';
import { GameState } from './play/gameState';
import { Player } from './player';
import { LobbyEvent, LobbyNotifier } from './lobby/lobbyNotifier';
import { SelectEvent, SelectNotifier } from './selectNotifier'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

function randomChoice(array) {
  return [...array][Math.floor(Math.random() * [...array].length)];
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

function countVotes(votes) {
  let count = 0;
  [...votes].forEach((vote) => {count += vote ? 1 : -1});
  return count;
};

function countActivePlayers(players) {
  let count = 0;
  [...players].forEach((player) => {
    if (player.active) {
      count += 1;
    }
  });
  return count;
}

function App() {
  const [username, setUsername] = React.useState(localStorage.getItem('username') || '');
  const [id, setId] = React.useState(localStorage.getItem('id') || '');
  const [token, setToken] = React.useState(localStorage.getItem('token') || '');

  const localStats = localStorage.getItem('stats');
  const [stats, setStats] = React.useState(localStats ? JSON.parse(localStats) : null);

  const [myLobby, setMyLobby] = React.useState(localStorage.getItem('myLobby') || '');
  const [currLobby, setCurrLobby] = React.useState(localStorage.getItem('currLobby') || '');

  const currentAuthState = username ? AuthState.Authenticated : AuthState.Unauthenticated;
  const [authState, setAuthState] = React.useState(currentAuthState);
  const localGameState = localStorage.getItem('gameState');
  const currentGameState = authState === AuthState.Unauthenticated ? GameState.Unknown : localGameState ? JSON.parse(localGameState) : null;
  const [gameState, setGameState] = React.useState(currentGameState);

  const localPlayers = localStorage.getItem('players');
  const [players, setPlayers] = React.useState(localPlayers ? JSON.parse(localPlayers) : []);
  const localQuestions = localStorage.getItem('questions');
  const [questions, setQuestions] = React.useState(localQuestions ? JSON.parse(localQuestions) : []);
  const [question, setQuestion] = React.useState(localStorage.getItem('question') || '');
  const localAnswers = localStorage.getItem('answers');
  const [answers, setAnswers] = React.useState(localAnswers ? new Map(Object.entries(JSON.parse(localAnswers))) : new Map());
  const localBallots = localStorage.getItem('ballots');
  const [ballots, setBallots] = React.useState(localBallots ? new Map(Object.entries(JSON.parse(localBallots))) : new Map());
  const [kickId, setKickId] = React.useState(localStorage.getItem('kickId') || '');
  const [kickAnswer, setKickAnswer] = React.useState(localStorage.getItem('kickAnswer') || '');
  const localVotes = localStorage.getItem('votes');
  const [votes, setVotes] = React.useState(localVotes ? JSON.parse(localVotes) : []);
  const [botId, setBotId] = React.useState(localStorage.getItem('botId') || '');
  
  const initGamePrompt = 'Ask A Question';
  const [gamePrompt, setGamePrompt] = React.useState(localStorage.getItem('gamePrompt') || initGamePrompt);
  const [active, setActive] = React.useState(id && id.length > 0);
  const [sent, setSent] = React.useState(false);
  const [kicked, setKicked] = React.useState(false);
  const [botFound, setBotFound] = React.useState(false);

  const initGameTime = 30;
  const initLobbyTime = 5;
  const [gameTime, setGameTime] = React.useState(initGameTime);
  const [lobbyTime, setLobbyTime] = React.useState(initLobbyTime);
  const lobbyCapacity = 4;

  React.useEffect(() => {
    if (authState === AuthState.Authenticated) {
      localStorage.setItem('gameState', JSON.stringify(gameState));
      localStorage.setItem('players', JSON.stringify(players));
      localStorage.setItem('questions', JSON.stringify(questions));
      localStorage.setItem('answers', JSON.stringify(Object.fromEntries(answers)));
      localStorage.setItem('ballots', JSON.stringify(Object.fromEntries(ballots)));
      localStorage.setItem('myLobby', myLobby);
      localStorage.setItem('currLobby', currLobby);
      localStorage.setItem('question', question);
      localStorage.setItem('gamePrompt', gamePrompt);
      localStorage.setItem('kickId', kickId);
    } 
    else {
      localStorage.clear();
    }
  }, [authState, gameState, players, questions, answers, ballots, myLobby, currLobby]);

  React.useEffect(() => {
    let mounted = myLobby !== currLobby;
    SelectNotifier.addHandler((event) => {
      if (mounted) {
        handleSelectEvent(event);
      }
    });
    return () => {
      mounted = false;
      SelectNotifier.removeHandler(handleSelectEvent);
    };
  }, [myLobby, currLobby, setGamePrompt, setQuestion, setKickId, gamePrompt, question, kickId]);

  function handleSelectEvent(event) {
    if (myLobby !== currLobby) {
      if (event.type === SelectEvent.Question) {
        setQuestion(event.value.question);
        setGamePrompt(event.value.question);
        fetch(
          `/api/bot/question`,
          {
            method: 'post',
            body: JSON.stringify({
              token: token,
              question: question,
            }),
            headers: {
              'Content-type': 'application/json',
            },
          }
        );
      }
      else if (event.type === SelectEvent.Vote) {
        console.log(event);
        setKickId(event.value.id);
        setKickAnswer(event.value.answer);
        if (event.value.botFound) {
          setBotFound(true);
          const newPlayers = onKick(botId);
          const myPlayer = new Player();
          setAnswers(initAnswers([...newPlayers, myPlayer]));
          setBallots(initBallots([...newPlayers, myPlayer]));

        }
      }
    }
  };

  function clear(logout = true) {
    // Clear local storage first
    localStorage.clear();

    // Reset all states
    if (logout) {
      setUsername('');
      setId('');
      setAuthState(AuthState.Unauthenticated);
      setStats(null);
    }
    setBotId('');
    setGameState(GameState.Unknown);
    setMyLobby('');
    setCurrLobby('');
    setPlayers([]);
    setQuestion('');
    setQuestions([]);
    setAnswers(new Map());
    setBallots(new Map());
    setKickId('');
    setKickAnswer('');
    setVotes([]);
    setGamePrompt(initGamePrompt);
    setActive(false);
    setSent(false);
    setKicked(false);
    setBotFound(false);
    setGameTime(initGameTime);
    setLobbyTime(initLobbyTime);
  };

  function onEnterLobby() {
    const lobbyId = v4();
    setMyLobby(lobbyId);
    setCurrLobby(lobbyId);
    LobbyNotifier.broadcastEvent(id, null, LobbyEvent.Start, null);
  };

  function connectBot() {
    const newBotId = '56c68e6d-0585-4016-9150-52a0cd034655'; // Fake Bot ID
    setBotId(newBotId);
    return new Player(newBotId);
  };

  async function onConnect() {
    setActive(true);
    setSent(false);
    setPlayers(prev => {
      const newPlayers = [...prev, connectBot()];
      const myPlayer = new Player(id, !kicked);
      setAnswers(initAnswers([...newPlayers, myPlayer]));
      setBallots(initBallots([...newPlayers, myPlayer]));
      return newPlayers;
    });
    setGameState(GameState.Question);
    setGamePrompt(initGamePrompt);
  };

  async function onDisconnect() {
    clear();
  };

  async function onStartLobby(playerId, lobbyId) {
    if (isNewPlayer(playerId)) {
      LobbyNotifier.broadcastEvent(
        id, 
        playerId, 
        LobbyEvent.Join, 
        {
          lobby: lobbyId,
          player: new Player(id),
        }
      );
    }
  };
  
  function onJoinLobby(lobbyId, playerId, newPlayer) {
    setCurrLobby(lobbyId);
    addPlayer(newPlayer);
    LobbyNotifier.broadcastEvent(
      id, 
      playerId, 
      LobbyEvent.Accept, 
      new Player(id)
    );
  };

  function isNewPlayer(playerId) {
    if (!players) {
      return true;
    }
    let repeat = false;
    players.forEach((player) => {
      if (player.id === playerId) {
        repeat = true;
      }
    });
    return !repeat;
  };

  async function addPlayer(player) {
    setPlayers(prev => {
      if (prev.length < lobbyCapacity) {
        let repeat = false;
        prev.forEach((prevPlayer) => {
          if (prevPlayer.id === player.id) {
            repeat = true;
          }
        })
        if (repeat) {
          return prev;
        }
        else {
          const newPlayers = [...prev, player];
          return newPlayers;
        }
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
      let trueNegatives = 0;
      let truePositives = 0;
      let falseNegatives = 0;
      let falsePositives = 0;
      players.forEach((player) => {
        if (player.active) {
          if (myBallot.includes(player.id)) {
            if (player.id === botId) {
              truePositives += 1;
            }
            else {
              falsePositives += 1;
            }
          }
          else {
            if (player.id === botId) {
              falseNegatives += 1;
            }
            else {
              trueNegatives += 1;
            }
          }
        }
      });
      fetch(
        `api/stats/write/precision`,
        {
          method: 'post',
          body: JSON.stringify({
            truePositives: truePositives,
            trueNegatives: trueNegatives,
            falsePositives: falsePositives,
            falseNegatives: falseNegatives,
          }),
          headers: {
            'Content-type': 'application/json',
          },
        }
      );
      onReceiveBallot(id, myBallot);
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
    }
  };

  async function onReceiveVote(newVote) {
    setVotes((prev) => [...prev, newVote]);
  };

  async function onQuit() {
    onGameEnd(gameState !== GameState.Results);
  };
  
  async function onGameEnd(quit = false) {
    await fetch(
      `/api/stats/write/accuracy`,
      {
        method: 'post',
        body: JSON.stringify({
          wins: !quit && botFound && active ? 1 : 0,
          botsRescued: !quit && !botFound && active ? 1 : 0,
          captchasFailed: !quit && !active ? 1 : 0,
          connectionsLost: quit ? 1 : 0,
        }),
        headers: {
          'Content-type': 'application/json'
        }
      }
    );
    await fetch(
      `/api/stats/read`,
      {
        method: 'get',
        headers: {
          'token': token,
        },
      }
    ).then(
      (response) => response.json()
    ).then(
      (newStats) => setStats(newStats)
    );
    clear(false);
  };

  async function onAuthChange(newUsername, newId, newToken, newAuthState) {
    if (newAuthState === AuthState.Unauthenticated) {
      clear();
    }
    else if (newAuthState === AuthState.Authenticated) {
      await fetch(
        '/api/stats/read',
        {
          method: 'get',
          headers: {
            'token': newToken,
          },
        }
      ).then(
        (response) => response.json()
      ).then(
        (newStats) => setStats(newStats)
      );
    }
    setUsername(newUsername);
    setId(newId);
    setToken(newToken);
    setAuthState(newAuthState);
  };

  function onKick(newKickId) {
    const newPlayers = [];
    if (newKickId === id) {
      setActive(false);
      players.forEach((player) => newPlayers.push(player));
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
    return newPlayers;
  };

  async function onNextGame() {
    setSent(false);
    if (gameState === GameState.Question) {
      if (myLobby === currLobby) {
        const newQuestion = randomChoice(questions);
        SelectNotifier.broadcastEvent(
          SelectEvent.Question, 
          {
            question: newQuestion,
          }
        );
        setGamePrompt(newQuestion);
        fetch(
          `/api/bot/question`,
          {
            method: 'post',
            body: JSON.stringify({
              token: token,
              question: newQuestion,
            }),
            headers: {
              'Content-type': 'application/json',
            },
          }
        );
      }
      else {
        setGamePrompt(question);
      }
      setQuestions([]);
      setGameState(GameState.Answer);
    }
    else if (gameState === GameState.Answer) {
      setGameState(GameState.Ballot);
    }
    else if (gameState === GameState.Ballot) {
      let newKickAnswer = null;
      let myPlayer = null;
      let newPlayers = null;
      if (myLobby === currLobby) {
        const newKickId = countBallots(ballots);
        setKickId(newKickId);
        newKickAnswer = answers.get(newKickId);
        SelectNotifier.broadcastEvent(
          SelectEvent.Vote,
          {
            id: newKickId,
            botFound: newKickId === botId,
            answer: newKickAnswer,
          }
        );
        myPlayer = new Player(id, newKickId === id && !kicked);
        newPlayers = onKick(newKickId);
        if (newKickId === botId) {
          setBotFound(true);
        }
        setKickAnswer(newKickAnswer);
        setAnswers(initAnswers([...newPlayers, myPlayer]));
        setBallots(initBallots([...newPlayers, myPlayer]));
      }
      else {
        newKickAnswer = answers.get(kickId);
        myPlayer = new Player(id, kickId === id);
        newPlayers = onKick(kickId);
      }
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
      if (countVotes(votes) < 0 || countActivePlayers([...players, new Player(id, active)]) < 3) {
        setGamePrompt(initGamePrompt);
        setGameState(GameState.Question);
      }
      else {
        setGamePrompt(`Results: The Bot Was ${botFound ? '' : 'Not'} Found`);
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
                id={id}
                token={token}
                authState={authState}
                gameState={gameState}
                onAuthChange={onAuthChange}
                onEnterLobby={onEnterLobby}
              />
            }
            exact
          />
          <Route
            path='/lobby' 
            element={
              <Lobby 
                username={username} 
                id={id}
                lobby={currLobby}
                players={players}
                totalTime={initLobbyTime}
                time={lobbyTime}
                capacity={lobbyCapacity}
                size={players.length}
                onUpdateTime={setLobbyTime}
                onAddPlayer={addPlayer}
                onRemovePlayer={(player) => setPlayers(players.filter((p) => p !== player))}
                onStartLobby={onStartLobby}
                onJoinLobby={onJoinLobby}
                isNewPlayer={isNewPlayer}
                onConnect={onConnect}
                onDisconnect={onDisconnect}
              />
            } 
          />
          <Route 
            path='/play' 
            element={
              <Play
                username={username} 
                id={id}
                token={token}
                players={players}
                questions={questions}
                answers={answers}
                kickId={kickId}
                botId={botId}
                kickAnswer={kickAnswer}
                totalTime={initGameTime}
                time={gameTime}
                gamePrompt={gamePrompt}
                active={active}
                sent={sent}
                state={gameState}
                inLobby={(playerId) => !isNewPlayer(playerId)}
                onUpdateTime={setGameTime}
                onSubmitQuestion={onSubmitQuestion}
                onSubmitAnswer={onSubmitAnswer}
                onSubmitBallot={onSubmitBallot}
                onSubmitVote={onSubmitVote}
                onReceiveQuestion={onReceiveQuestion}
                onReceiveAnswer={onReceiveAnswer}
                onReceiveBallot={onReceiveBallot}
                onReceiveVote={onReceiveVote}
                onKick={onKick}
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
                stats={stats}
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
                id={id}
                token={token}
                authState={authState}
                gameState={gameState}
                onAuthChange={onAuthChange}
                onEnterLobby={onEnterLobby}
              />
            }
            exact
          />
          <Route path='*' element={<NotFound />} />
        </Routes>

        <footer className='bg-dark'>
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
