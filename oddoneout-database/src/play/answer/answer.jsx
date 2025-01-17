import React from 'react';
import Stack from '@mui/material/Stack';
import Button from 'react-bootstrap/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import { Player } from '../../player';
import { AnswerNotifier } from './answerNotifier';

export function Answer(props) {
  const [received, setReceived] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [botAnswer, setBotAnswer] = React.useState(localStorage.getItem('botAnswer') || '');

  async function getBotAnswer() {
    await fetch(
      '/api/bot/answer',
      {
        method: 'get',
        headers: {
          token: props.token,
        },
      },
    ).then(
      (response) => response.json()
    ).then(
      (pojo) => {
        setBotAnswer(pojo.answer);
        setReceived(true);
      }
    );
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!received) {
        getBotAnswer();
      }
      else if (!sent) {
        setSent(true);
        props.onReceive(props.botId, botAnswer);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [props.botId, received, sent]);

  React.useEffect(() => {
    let mounted = true;
    AnswerNotifier.addHandler((event) => {
      if (mounted) {
        handleAnswerEvent(event);
      }
    });
    return () => {
      mounted = false;
      AnswerNotifier.removeHandler(handleAnswerEvent);
    };
  }, []);

  function handleAnswerEvent(event) {
    props.onReceive(event.from, event.value);
  };

  async function submit() {
    AnswerNotifier.broadcastEvent(
      props.id,
      props.answer
    );
    props.onSubmit();
  };

  return (
    <div> 
      <div className='answer' >
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'bg-primary' }}>
          {Array.from(props.ballot.keys()).map((id) => {
            return (
              <ListItem
                key={id}
                disablePadding
              >
                <ListItemButton role={undefined} onClick={() => props.onToggle(id)} dense>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={props.ballot.get(id)}
                      tabIndex={-1}
                      disableRipple
                      inputProps={{ 'aria-labelledby': `${id}` }}
                      color='black'
                    />
                  </ListItemIcon>
                  <ListItemText id={`answer-${id}`} primary={props.answers.get(id)} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </div>
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
        <input 
          id='answer' 
          type='text' 
          value={props.answer} 
          onChange={(e) => props.onChange(e.target.value)}
          placeholder='your answer here'
        />
        <Button id='submit' onClick={() => submit()} disabled={!props.allow}>Submit</Button>
      </Stack>
    </div>
  );
}
