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
import { BallotNotifier } from './ballotNotifier';
import { Player } from '../../player';

function processCheckList(map) {
  const array = [];
  map.keys().forEach((key) => {
    if (map.get(key)) {
      array.push(key);
    }
  });
  return array;
};

export function Ballot(props) {
  const [ids, setIds] = React.useState([]);

  React.useEffect(() => {
    setIds(Array.from(props.ballot.keys()));
  }, [props.ballot]);

  React.useEffect(() => {
    let mounted = true;
    BallotNotifier.addHandler((event) => {
      if (mounted) {
        handleBallotEvent(event);
      }
    });
    return () => {
      mounted = false;
      BallotNotifier.removeHandler(handleBallotEvent);
    };
  }, []);

  function handleBallotEvent(event) {
    props.onReceive(event.from, event.value);
  };

  async function submit() {
    const newBallot = processCheckList(props.ballot);
    BallotNotifier.broadcastEvent(props.id, newBallot);
    props.onSubmit(newBallot);
  };

  return (
    <div> 
      <h3>Select The Bot</h3>
      <div className='answer' >
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'bg-primary' }}>
          {ids.map((id) => (
            <ListItem
              key={id}
              disablePadding
            >
              <ListItemButton role={undefined} onClick={() => props.allow && props.onToggle(id)} dense>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={props.ballot.get(id)}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ 'aria-labelledby': `${id}` }}
                    color='black'
                    disabled={!props.allow}
                  />
                </ListItemIcon>
                <ListItemText id={`answer-${id}`} primary={props.answers.get(id)} />
              </ListItemButton>
            </ListItem>
          ))}
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
        <Button id='submit' onClick={() => submit()} disabled={!props.allow}>Submit</Button>
      </Stack>
    </div>
  );
}
