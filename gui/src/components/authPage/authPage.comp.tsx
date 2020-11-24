import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from '../button/button.comp';
import { toast } from 'react-toastify';
import { withAppContext } from '../withContext/withContext.comp';
import locale from '../../common/locale.js';
import { IAppContext } from '../app.context';

import './authPage.scss';

interface IProps { context: IAppContext }

const AuthPageComp = ({ context }: IProps) => {
  const { location, replace } = useHistory();
  const [user, setUser] = useState<string>('');
  const [pwd, setPwd] = useState<string>('');
  const { activePage, error, setError, httpService, config } = context;

  async function submitForm(e: any) {
    e.preventDefault();
    try {
        const credentials = { username: `${user}`, password: `${pwd}`}
        const result = await httpService.fetch({
            method: 'post',
            origUrl: httpService.loginUrl,
            body: JSON.stringify(credentials),
            headers: { 'content-type': 'application/json' }
        });
        if (!result) { throw new Error(locale.login_error) };
        sessionStorage.setItem('diten-token', result.token);
        const { from } = location.state || { from: { pathname: '/' } };
        replace(from);
    } 
    catch (e) { 
        setError(e.message); 
        toast.error(e.message);
    }
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
          <label>{locale.username}</label>
          <input type="text" placeholder={locale.username_suggestion} onChange={handleUserChange} />
        </div>
        <div className='form-row row'>
          <label>{locale.password}</label>
          <input type="password" placeholder={locale.password_suggenstion} onChange={handlePwdChange} />
        </div>
        <div className="buttons-wrapper center">
          <Button type="submit" onClick={submitForm} color="green">{locale.submit}</Button>
        </div>
      </form>
    </div>
  );
}

export const AuthPage = withAppContext(AuthPageComp);