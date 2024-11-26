import React from 'react';
import { useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Button from 'react-bootstrap/Button';
import { Tag } from '../tag';
import { Timer } from '../timer';
import { Player } from '../player';
import { Question } from './question/question';
import { Answer } from './answer/answer';
import { Ballot } from './ballot/ballot';
import { Kick } from './kick/kick';
import { Vote } from './vote/vote';
import { Results } from './results/results';
import { GameState } from './gameState';
import './play.css';

function processCheckList(map) {
  const array = [];
  map.keys().forEach((key) => {
    if (map.get(key)) {
      array.push(key);
    }
  });
  return array;
};

function initBallot(players) {
  const newBallot = new Map();
  [...players].forEach((player) => {
    if (player.active) {
      newBallot.set(player.id, false);
    }
  });
  return newBallot;
};


const timer = new Timer();

export function Play(props) {
  const [question, setQuestion] = React.useState(localStorage.getItem('question') || '');
  const [answer, setAnswer] = React.useState(localStorage.getItem('answer') || '');
  const localBallot = localStorage.getItem('ballot');
  const [ballot, setBallot] = React.useState(localBallot ? new Map(Object.entries(JSON.parse(localBallot))) : initBallot(props.players));
  const [vote, setVote] = React.useState(localStorage.getItem('vote') || false);
  const navigate = useNavigate();
  const timeDisplay = `${Math.floor(props.time / 60)}:${("0" + (props.time % 60)).slice(-2)}`;

  React.useEffect(() => {
    if (!timer.on) {
      timer.set(props.totalTime);
      timer.start();
    }
    const interval = setInterval(() => {
      let now = timer.now();
      props.onUpdateTime(prev => now);
      if (now <= 0) {
        timer.reset();
        props.onUpdateTime(prev => timer.now());
        if (props.state === GameState.Results) {
          props.onEnd();
          timer.stop();
          navigate('/login');
        }
        else {
          props.onNextGame();
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [props.onUpdateTime, props.onNextGame]);
 
  async function updateBallot(id) {
    setBallot((prev) => {
      if (prev.has(id)) {
        const newBallot = new Map(prev);
        newBallot.set(id, !prev.get(id));
        return newBallot;
      }
      else {
        return prev;
      }
    });
  };

  async function onSubmitBallot() {
    props.onSubmitBallot(processCheckList(ballot));
  };

  async function onReceiveBallot(id, newBallot) {
    props.onReceiveBallot(id, newBallot);
  };

  async function quit() {
    props.onQuit();
    timer.stop();
    navigate('/login');
  };

  return (
    <main className='bg-secondary'>
      <div>
        {props.state !== GameState.Unknown && (
          <div>
            <span id="time">{timeDisplay}</span>
            <h2 id="prompt">{props.gamePrompt}</h2>
          </div>
        )}
      </div>
      <div>
        {props.state === GameState.Question && (
          <Question 
            question={question}
            onChange={(e) => setQuestion(e)}
            onSubmit={() => props.onSubmitQuestion(question)}
            onReceive={(e) => props.onReceiveQuestion(e)}
            allow={props.active && !props.sent}
          />
        )}
        {props.state === GameState.Answer && (
          <Answer 
            answer={answer}
            ballot={ballot}
            answers={props.answers}
            onChange={(e) => setAnswer(e)}
            onToggle={(e) => updateBallot(e)}
            onSubmit={() => props.onSubmitAnswer(answer)}
            onReceive={(k, v) => props.onReceiveAnswer(k, v)}
            allow={props.active && !props.sent}
          />
        )}
        {props.state === GameState.Ballot && (
          <Ballot 
            ballot={ballot}
            answers={props.answers}
            onToggle={(e) => updateBallot(e)}
            onSubmit={() => onSubmitBallot()}
            onReceive={(k, v) => onReceiveBallot(k, v)}
            allow={props.active && !props.sent}
          />
        )}
        {props.state === GameState.Kick && (
          <Kick 
            id={props.kickId}
            answer={props.kickAnswer}
          />
        )}
        {props.state === GameState.Vote && (
          <Vote 
            onSubmit={(e) => props.onSubmitVote(e)}
            onReceive={(e) => props.onReceiveVote(e)}
            allow={props.active && !props.sent}
          />
        )}
        {props.state === GameState.Results && (
          <Results />
        )}
      </div>
      <div>
        {props.gameState !== GameState.Unknown && (
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
              <Button id='quit' className='btn btn-danger' onClick={() => quit()}>Quit</Button>
            </Stack>
            <Tag username={props.username}/>
          </div>
        )}
      </div>
    </main>
  );
}
