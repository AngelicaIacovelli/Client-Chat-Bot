import { GoogleLogin } from '@react-oauth/google';
import { loginUser, registerUser } from '../services/api';

function LoginPage() {
    const handleGoogleLogin = async (credentialResponse) => {
      try {
        const response = await loginUser(credentialResponse);
        console.log('Login successful:', response);
        // Handle successful login (e.g., store token, redirect)
      } catch (error) {
        console.error('Login failed:', error);
        // Handle login error
      }
    };
  
    const handleGoogleRegister = async (credentialResponse) => {
      try {
        const response = await registerUser(credentialResponse);
        console.log('Registration successful:', response);
        // Handle successful registration (e.g., show success message, auto-login)
      } catch (error) {
        console.error('Registration failed:', error);
        // Handle registration error
      }
    };
  
  return (
    <div>
      <h1>Login or Register</h1>
      <GoogleLogin
        onSuccess={handleGoogleLogin}
        onError={() => console.log('Login Failed')}
        useOneTap
      />
      <GoogleLogin
        onSuccess={handleGoogleRegister}
        onError={() => console.log('Registration Failed')}
        text="signup_with"
      />
    </div>
  );
}

export default LoginPage;
