import React, { useState } from 'react';
import './Authpage.css';
import { auth } from '../firebase'; 
import { useNavigate } from "react-router-dom";
import axios from 'axios';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  // Login form states
  const [loginEmail, setLoginEmail] = useState(''); 
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form states
  const [signUpFirstName, setSignUpFirstName] = useState('');
  const [signUpLastName, setSignUpLastName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState(''); // NEW: phone state
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signUpRole, setSignUpRole] = useState('consumer'); // role: consumer or provider

  // Provider-specific info
  const [businessName, setBusinessName] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');

  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const clearMessage = () => setMessage('');

  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessage();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      const idToken = await userCredential.user.getIdToken();

      await axios.post('http://localhost:5000/api/login', {}, {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      setMessage(`Login successful! Welcome, ${userCredential.user.email}`);
      navigate('/MainUI');
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

      const idToken = await userCredential.user.getIdToken();

      // Compose user data payload
      const userData = {
        uid: userCredential.user.uid,
        email: signUpEmail,
        displayName: `${signUpFirstName} ${signUpLastName}`,
        firstName: signUpFirstName,
        lastName: signUpLastName,
        role: signUpRole,
        phone: signUpPhone, 
      };

      if (signUpRole === 'provider') {
        userData.businessName = businessName;
        userData.businessDescription = businessDescription;
      }

      // Send user info to backend for database storage
      await axios.post('http://localhost:5000/api/users', userData, {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      setMessage("Account created successfully!");
      navigate('/MainUI');
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

            <label>
              <input
                type="radio"
                value="consumer"
                checked={signUpRole === 'consumer'}
                onChange={() => setSignUpRole('consumer')}
              />
              Consumer
            </label>
            <label>
              <input
                type="radio"
                value="provider"
                checked={signUpRole === 'provider'}
                onChange={() => setSignUpRole('provider')}
              />
              Provider
            </label>

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

            <label htmlFor="signUpPhone">Phone Number:</label>
            <input
              type="tel"
              id="signUpPhone"
              value={signUpPhone}
              pattern="^\d{8}$"
              minLength={8}
              maxLength={8}
              inputMode="numeric"
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/[^0-9]/g, "");
                setSignUpPhone(onlyNums);
              }}
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

            {signUpRole === 'provider' && (
              <>
                <label htmlFor="businessName">Business Name:</label>
                <input
                  type="text"
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />

                <label htmlFor="businessDescription">Business Description:</label>
                <textarea
                  id="businessDescription"
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  required
                />
              </>
            )}

            <button type="submit">Create Account</button>
            <p className="message">{message}</p>
          </form>
        )}
      </div>
    </div>
  );
}
