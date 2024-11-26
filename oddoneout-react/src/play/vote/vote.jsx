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
import { VoteNotifier } from './voteNotifier';
import { Player } from '../../player';

export function Vote(props) {

  React.useEffect(() => {
    VoteNotifier.addHandler(handleVoteEvent);
    return () => {
      VoteNotifier.removeHandler(handleVoteEvent);
    }
  }, []);

  async function handleVoteEvent(event) {
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
        <Button variant='success' onClick={() => props.onSubmit(true)} disabled={!props.allow}>
          Yes
        </Button>
        <Button variant='warning' onClick={() => props.onSubmit(false)} disabled={!props.allow}>
          No
        </Button>
      </Stack>
    </div>
  );
}
