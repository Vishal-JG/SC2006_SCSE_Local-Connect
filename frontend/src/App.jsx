import React, { useEffect, useState } from 'react';
import AuthPage from './pages/Authpage';
import Homepage from './pages/Homepage';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, loggedInUser => {
      setUser(loggedInUser);
    });

    return () => unsubscribe();
  }, []);

  return <div>{user ? <Homepage user={user} /> : <AuthPage />}</div>;
}
