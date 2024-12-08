import React from 'react';
import './tag.css';

export function Tag(props) {
  const username = props.username;

  return (
    <div className='tag'>
      Player
      <span className='tag-name'>{username}</span>
    </div>
  );
}
