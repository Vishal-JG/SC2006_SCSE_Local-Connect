import React, { useState } from 'react';
import './Authpage.css';
import { auth } from './firebase'; 
import { useNavigate } from "react-router-dom";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signUpFirstName, setSignUpFirstName] = useState('');
  const [signUpLastName, setSignUpLastName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const clearMessage = () => setMessage('');

  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessage();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      setMessage(`Login successful! Welcome, ${userCredential.user.email}`);
      navigate("/service");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    clearMessage();
    if (signUpPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signUpEmail,
        signUpPassword
      );
      await updateProfile(userCredential.user, {
        displayName: `${signUpFirstName} ${signUpLastName}`,
      });
      setMessage("Account created successfully!");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="container">
      <div className="login-alignment">
        <div className="toggle-buttons">
          <button
            className={isLogin ? 'active' : ''}
            onClick={() => {
              setIsLogin(true);
              clearMessage();
            }}
          >
            Login
          </button>
          <button
            className={!isLogin ? 'active' : ''}
            onClick={() => {
              setIsLogin(false);
              clearMessage();
            }}
          >
            Sign Up
          </button>
        </div>

        {isLogin ? (
          <form onSubmit={handleLogin} className="form">
            <h2>Login</h2>

            <label htmlFor="loginEmail">Email (username):</label>
            <input
              type="email"
              id="loginEmail"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />

            <label htmlFor="loginPassword">Password:</label>
            <input
              type="password"
              id="loginPassword"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />

            <button type="submit">Login</button>
            <p className="message">{message}</p>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="form">
            <h2>Create Account</h2>

            <label htmlFor="firstName">First Name:</label>
            <input
              type="text"
              id="firstName"
              value={signUpFirstName}
              onChange={(e) => setSignUpFirstName(e.target.value)}
              required
            />

            <label htmlFor="lastName">Last Name:</label>
            <input
              type="text"
              id="lastName"
              value={signUpLastName}
              onChange={(e) => setSignUpLastName(e.target.value)}
              required
            />

            <label htmlFor="signUpEmail">Email (username):</label>
            <input
              type="email"
              id="signUpEmail"
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
              required
            />

            <label htmlFor="signUpPassword">Password:</label>
            <input
              type="password"
              id="signUpPassword"
              value={signUpPassword}
              onChange={(e) => setSignUpPassword(e.target.value)}
              required
            />

            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button type="submit">Create Account</button>
            <p className="message">{message}</p>
          </form>
        )}
      </div>
    </div>
  );
}
