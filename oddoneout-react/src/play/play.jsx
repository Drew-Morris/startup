import React from 'react';
import Stack from '@mui/material/Stack';
import { Players } from './players';
import { Timer } from './timer';
import { Answers } from './answers';

export function Play(props) {
  const [query, setQuery] = React.useState("What is your favorite color?")
  const [players, setPlayers] = React.useState(["Alice", "Bob", "Carl", "Drew", "Emily"]);
  const [answers, setAnswers] = React.useState(["Blue", "Green", "Red", "Blue", "Pink"]);
  const [time, setTime] = React.useState(props.time || 0);
  React.useEffect(() => {
    const timer = new Timer(time);
    const interval = setInterval(() => {
      setTime(timer.now());
    }, 100);
    return () => clearInterval(interval);
  }, []);
  const timeDisplay = `${Math.floor(time / 60)}:${time % 60}`;
  return (
    <main className='bg-secondary'>
      <div id="timer">
        <span id="time">{timeDisplay}</span>
      </div>
      <div id="query">
        <h2 id="prompt">{query}</h2>
      </div>
      <Answers players={players} answers={answers} />
      <Stack 
        direction="row" 
        width="100%" 
        sx={{ 
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <input id="answer" placeholder="Your answer here" />
        <button id="submit">Submit Answer</button>
      </Stack>
      <Players username={props.username} />
    </main>
  );
}
