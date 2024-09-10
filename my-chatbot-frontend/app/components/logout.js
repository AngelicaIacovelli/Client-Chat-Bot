import { googleLogout } from '@react-oauth/google';

function LogoutButton() {
  const handleLogout = () => {
    googleLogout();
    // Additional logout logic here
  };

  return <button onClick={handleLogout}>Logout</button>;
}

export default LogoutButton;
