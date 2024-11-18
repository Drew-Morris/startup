import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import './answers.css'

export function Answers(props) {
  const [checked, setChecked] = React.useState([]);
  const [players, setPlayers] = React.useState(props.players || []);
  const [answers, setAnswers] = React.useState(props.answers || []);
  const handleToggle = (i) => () => {
    const curr = checked.indexOf(i);
    const newChecked = [...checked];
    if (curr === -1) {
      newChecked.push(i);
    } else {
      newChecked.splice(curr, 1);
    }
    setChecked(newChecked);
  };
  return (
    <div className='answer'>
      <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'bg-primary' }}>
        {[0, 1, 2, 3, 4].map((i) => {
          return (
            <ListItem
              key={i}
              disablePadding
            >
              <ListItemButton role={undefined} onClick={handleToggle(i)} dense>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={checked.includes(i)}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ 'aria-labelledby': `${i}` }}
                    color='black'
                  />
                </ListItemIcon>
                <ListItemText id={`player-${i}`} primary={props.players[i]} />
                <ListItemText id={`answer-${i}`} primary={props.answers[i]} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );
}
