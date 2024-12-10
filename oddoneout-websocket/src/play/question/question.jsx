import React from 'react';
import Stack from '@mui/material/Stack';
import Button from 'react-bootstrap/Button';
import { Player } from '../../player';
import { QuestionNotifier } from './questionNotifier';

export function Question(props) {

  React.useEffect(() => {
    let mounted = true;
    QuestionNotifier.addHandler((event) => {
      if (mounted) {
        handleQuestionEvent(event);
      }
    });
    return () => {
      QuestionNotifier.removeHandler(handleQuestionEvent);
      mounted = false;
    };
  }, [props.questions, props.inLobby, props.onReceive, handleQuestionEvent]);

  async function handleQuestionEvent(event) {
    if (props.inLobby(event.from)) {
      props.onReceive(event.value);
    }
  };

  async function submit() {
    QuestionNotifier.broadcastEvent(
      props.id,
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
