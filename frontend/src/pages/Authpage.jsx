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
  const [loginEmail, setLoginEmail] = useState(''); 
  const [loginPassword, setLoginPassword] = useState('');

  const [signUpFirstName, setSignUpFirstName] = useState('');
  const [signUpLastName, setSignUpLastName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signUpRole, setSignUpRole] = useState('consumer');
  const [businessName, setBusinessName] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');

  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const clearMessage = () => setMessage('');
  
  function getFriendlyAuthError(error) {
  if (!error || !error.code) return "An unexpected error occurred. Please try again.";
  switch (error.code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-not-found":
      return "No account found with that email.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/email-already-in-use":
      return "This email is already registered. Please login instead.";
    case "auth/weak-password":
      return "Your password should be at least 6 characters.";
    case "auth/missing-password":
      return "Please enter your password.";
    case "auth/network-request-failed":
      return "Network error, please check your internet connection.";
    case "auth/invalid-credential":
      return "Invalid credentials. Please login with a valid account.";
    // Add others as needed
    default:
      return error.message || "Something went wrong. Please try again.";
  }
}

  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessage();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      const idToken = await userCredential.user.getIdToken();
      await axios.post('http://localhost:5000/api/login', {}, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      localStorage.setItem("token", idToken);
      setMessage(`Login successful! Welcome, ${userCredential.user.email}`);
      navigate('/service');
    } catch (error) {
      setMessage(getFriendlyAuthError(error));
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
      await axios.post('http://localhost:5000/api/users', userData, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      setMessage("Account created successfully!");
      navigate('/MainUI');
    } catch (error) {
      setMessage(getFriendlyAuthError(error));
    }
  };

  return (
    <div className="auth-background">
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
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="loginEmail">Email (username):</label>
                  <input
                    type="email"
                    id="loginEmail"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="loginPassword">Password:</label>
                  <input
                    type="password"
                    id="loginPassword"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit">Login</button>
              <p className="message">{message}</p>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="form">
              <h2>Create Account</h2>
              <div className="role-toggle">
                <button
                  type="button"
                  className={signUpRole === "consumer" ? "toggle-active" : ""}
                  onClick={() => setSignUpRole("consumer")}
                >
                  Consumer
                </button>
                <button
                  type="button"
                  className={signUpRole === "provider" ? "toggle-active" : ""}
                  onClick={() => setSignUpRole("provider")}
                >
                  Provider
                </button>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name:</label>
                  <input
                    type="text"
                    id="firstName"
                    value={signUpFirstName}
                    onChange={(e) => setSignUpFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name:</label>
                  <input
                    type="text"
                    id="lastName"
                    value={signUpLastName}
                    onChange={(e) => setSignUpLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="signUpEmail">Email (username):</label>
                  <input
                    type="email"
                    id="signUpEmail"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
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
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="signUpPassword">Password:</label>
                  <input
                    type="password"
                    id="signUpPassword"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password:</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              {signUpRole === 'provider' && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="businessName">Business Name:</label>
                    <input
                      type="text"
                      id="businessName"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="businessDescription">Business Description:</label>
                    <textarea
                      id="businessDescription"
                      value={businessDescription}
                      onChange={(e) => setBusinessDescription(e.target.value)}
                      required
                      rows={4}       
                      className="large-textarea"
                    />
                  </div>
                </div>
              )}
              <button type="submit">Create Account</button>
              <p className="message">{message}</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
