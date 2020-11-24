import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from '../button/button.comp';

import './authPage.scss';

export const AuthPage = () => {
  const { location, replace } = useHistory();
  const [user, setUser] = useState<string>('');
  const [pwd, setPwd] = useState<string>('');


  function submitForm(e: any) {
    e.preventDefault();
    const encoded = new Buffer(`${user}:${pwd}`).toString('base64');
    sessionStorage.setItem('basic', `Basic ${encoded}`);
    const { from } = location.state || { from: { pathname: '/' } };
    replace(from);
  }

  function handleUserChange(event: any) {
    setUser(event.target.value);
  }

  function handlePwdChange(event: any) {
    setPwd(event.target.value);
  }

  return (
    <div className="auth-page">
      <form className='form-content' onSubmit={submitForm}>
        <div className='form-row row'>
          <label>User</label>
          <input type="text" placeholder='Enter user....' onChange={handleUserChange} />
        </div>
        <div className='form-row row'>
          <label>Password</label>
          <input type="password" placeholder='Enter password...' onChange={handlePwdChange} />
        </div>
        <div className="buttons-wrapper center">
          <Button type="submit" onClick={submitForm} color="green">Submit</Button>
        </div>
      </form>
    </div>
  );
}