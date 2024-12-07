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

export function Kick(props) {

  return (
    <div> 
      <h3>{props.id} Was Kicked</h3>
      <h3>({props.answer})</h3>
    </div>
  );
}
