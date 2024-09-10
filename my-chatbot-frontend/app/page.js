'use client';

import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import Chatbot from "./components/chatbot";
import styles from './page.module.css';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoginSuccess = (credentialResponse) => {
    console.log(credentialResponse);
    setIsAuthenticated(true);
  };

  if (isAuthenticated) {
    return <Chatbot />;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        <span className={styles.largeText}>Context</span>
        <br />
        <span className={styles.smallText}>by Nucleo Research</span>
      </h1>

      <div className={styles.authContainer}>
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={() => {
            console.log('Login Failed');
          }}
        />
      </div>
    </div>
  );
}
