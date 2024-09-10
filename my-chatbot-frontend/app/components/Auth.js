import React from 'react';
import { GoogleLogin } from '@react-oauth/google';


const Auth = ({ onLogin }) => {
  const responseGoogle = (response) => {
    if (response.tokenId) {
      onLogin(response.tokenId);
    }
  };

  return (
    <div>
      <h2>Login with Google</h2>
      <GoogleLogin
        clientId="535712446017-93leontoehv7i3v5bcpnokmb2f6qfgbv.apps.googleusercontent.com"
        buttonText="Login with Google"
        onSuccess={responseGoogle}
        onFailure={responseGoogle}
        cookiePolicy={'single_host_origin'}
      />
    </div>
  );
};

export default Auth;
