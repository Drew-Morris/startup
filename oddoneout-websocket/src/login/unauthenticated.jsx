import React from 'react';
import Button from 'react-bootstrap/Button';
import { MessageDialog } from './messageDialog';
import { Player } from '../player';

export function Unauthenticated(props) {
  const [username, setUsername] = React.useState(props.username);
  const [id, setId] = React.useState(props.id);
  const [password, setPassword] = React.useState('');
  const [displayError, setDisplayError] = React.useState(null);

  async function login() {
    connect(`api/auth/login`);
  };

  async function register() {
    connect(`api/auth/register`);
  };

  async function connect(endpoint) {
    const response = await fetch(
      endpoint,
      {
        method: 'post',
        body: JSON.stringify({
          email: username,
          password: password,
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8', 
        },
      }
    );
    if (response?.status === 200) {
      localStorage.setItem('username', username);
      const body = await response.json();
      localStorage.setItem('id', body.id);
      localStorage.setItem('token', body.token);
      props.onLogin(username, body.id, body.token);
    }
    else {
      const body = await response.json();
      setDisplayError(`⚠ Error: ${body.msg}`);
    }
  };

  return (
    <>
      <div>
        <div className='input-group mb-3'>
          <span className='input-group-text'></span>
          <input 
            className='form-control' 
            type='text' 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder='your@email.com' 
          />
        </div>
        <div className='input-group mb-3'>
          <span className='input-group-text'></span>
          <input 
            className='form-control' 
            type='password' 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder='password' 
          />
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
