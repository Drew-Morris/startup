import React from 'react';
import Stack from '@mui/material/Stack';
import Button from 'react-bootstrap/Button';
import { Player } from '../../player';
import { QuestionNotifier } from './questionNotifier';

export function Question(props) {
  const [text, setText] = React.useState('');

  React.useEffect(() => {
    QuestionNotifier.addHandler(handleQuestionEvent);
    return () => {
      QuestionNotifier.removeHandler(handleQuestionEvent);
    };
  }, []);

  function handleQuestionEvent(event) {
    props.onReceive(event.value);
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
        <Button id='submit' onClick={() => props.onSubmit()} disabled={!props.allow}>Submit</Button>
      </Stack>
    </div>
  );
}
