import React from 'react';

import Button from 'react-bootstrap/Button';
import { MessageDialog } from './messageDialog';

export function Unauthenticated(props) {
  const [username, setUsername] = React.useState(props.username);
  const [password, setPassword] = React.useState('');
  const [displayError, setDisplayError] = React.useState(null);

  async function login() {
    localStorage.setItem('username', username);
    props.onLogin(username);
  }

  async function register() {
    localStorage.setItem('username', username);
    props.onLogin(username);
  }

  return (
    <>
      <div>
        <div className='input-group mb-3'>
          <span className='input-group-text'></span>
          <input className='form-control' type='text' value={username} onChange={(e) => setUsername(e.target.value)} placeholder='your@email.com' />
        </div>
        <div className='input-group mb-3'>
          <span className='input-group-text'></span>
          <input className='form-control' type='password' onChange={(e) => setPassword(e.target.value)} placeholder='password' />
        </div>
        <Button variant='primary' onClick={() => login()} disabled={!username || !password}>
          Login
        </Button>
        <Button variant='secondary' onClick={() => register()} disabled={!username || !password}>
          Register
        </Button>
      </div>

      <MessageDialog message={displayError} onHide={() => setDisplayError(null)} />
    </>
  );
}
