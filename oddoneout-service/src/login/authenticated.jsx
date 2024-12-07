import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import './authenticated.css';

export function Authenticated(props) {
  const navigate = useNavigate();

  function logout() {
    fetch(
      `api/auth/logout`,
      {
        method: 'delete',
      }
    ).catch(() => {
      console.log("Logout Failed")
    }).finally(() => {
      localStorage.clear();
      props.onLogout();
    });
  };

  return (
    <div>
      <div className='playerName'>{props.username}</div>
      <Button variant='primary' onClick={() => navigate(props.id && props.id.length > 0 ? '/play' : '/lobby')}>
        Play
      </Button>
      <Button variant='secondary' onClick={() => logout()}>
        Logout
      </Button>
    </div>
  );
}
