import React from 'react';
import Stack from '@mui/material/Stack';
import Button from 'react-bootstrap/Button';
import { Player } from '../../player';
import { QuestionNotifier } from './questionNotifier';

export function Question(props) {
  const [text, setText] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    QuestionNotifier.addHandler((event) => {
      if (mounted) {
        handleQuestionEvent(event);
      }
    });
    return () => {
      mounted = false;
      QuestionNotifier.removeHandler(handleQuestionEvent);
    };
  }, []);

  function handleQuestionEvent(event) {
    props.onReceive(event.value);
  };

  async function submit() {
    QuestionNotifier.broadcastEvent(
      new Player(
        props.id, 
        props.username
      ), 
      props.question
    );
    props.onSubmit();
  };

  return (
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
        <input 
          id='question' 
          type='text' 
          value={props.question} 
          onChange={(e) => props.onChange(e.target.value)}
          placeholder='your question here'
        />
        <Button id='submit' onClick={() => submit()} disabled={!props.allow}>Submit</Button>
      </Stack>
    </div>
  );
}
