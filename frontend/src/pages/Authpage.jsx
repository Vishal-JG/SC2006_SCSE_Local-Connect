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
  const [signUpRole, setSignUpRole] = useState('customer'); // 'customer' or 'provider'

  // Provider-specific info
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

  // --------------------- LOGIN ---------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessage();
    try {
      // CLEAR OLD DATA FIRST - prevents stale token/role issues
      localStorage.clear();
      
      // Firebase login
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      const idToken = await userCredential.user.getIdToken(true); // Force fresh token

      localStorage.setItem("token", idToken);

      // Step 1: Try to fetch profile directly (avoid unnecessary priming if user already exists)
      const getProfile = async () => axios.get('http://localhost:5000/api/users/me', {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      let profileResponse;
        try {
        profileResponse = await getProfile();
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401 || status === 404) {
          // Step 2: Prime backend session then retry profile
          try {
            await axios.post('http://localhost:5000/api/login', {}, {
              headers: { Authorization: `Bearer ${idToken}` }
            });
            profileResponse = await getProfile();
          } catch (retryErr) {
            setMessage(`Error: ${retryErr?.response?.data?.error || retryErr.message}`);
            return;
          }
        } else {
          setMessage(`Error: ${err?.response?.data?.error || err.message}`);
          return;
        }
      }

      if (!profileResponse?.data?.success) {
        setMessage(`Error fetching user profile: ${profileResponse?.data?.error || 'Unknown error'}`);
        return;
      }

      const userRole = profileResponse.data.user.role;
      localStorage.setItem("role", userRole);

      // Step 3: Wait for AuthContext to fully sync before navigating
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (userRole === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (userRole === 'provider') {
        navigate('/ProviderUI/ProviderDashboard', { replace: true });
      } else {
        navigate('/service', { replace: true }); // consumer
      }

      setMessage(`Login successful! Welcome, ${userCredential.user.displayName || loginEmail}`);
    } catch (error) {
      setMessage(getFriendlyAuthError(error));
    }
  };


  // --------------------- SIGNUP ---------------------
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

      const fullName = `${signUpFirstName} ${signUpLastName}`;
      
      await updateProfile(userCredential.user, {
        displayName: fullName,
      });

      // Force token refresh after updating profile to include displayName
      const idToken = await userCredential.user.getIdToken(true);

      // Compose signup payload for backend - include display_name explicitly
      const signupData = {
        role: signUpRole,
        phone: signUpPhone,
        display_name: fullName,
        business_name: signUpRole === 'provider' ? businessName : undefined,
        business_description: signUpRole === 'provider' ? businessDescription : undefined
      };

      const response = await axios.post('http://localhost:5000/api/login', signupData, {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      if (response.data.success) {
        localStorage.setItem("token", idToken);
        const userRole = response.data.user?.role || signUpRole;
        localStorage.setItem("role", userRole);
        setMessage(`Account created successfully as ${userRole}!`);
        
        // Wait for AuthContext to fully sync before navigating
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (userRole === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (userRole === 'provider') {
          navigate('/ProviderUI/ProviderDashboard', { replace: true });
        } else {
          navigate('/', { replace: true }); // consumer -> landing page
        }
      } else {
        setMessage(`Error: ${response.data.error}`);
      }
    } catch (error) {
      setMessage(getFriendlyAuthError(error));
    }
  };

  // --------------------- RENDER ---------------------
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
            <label htmlFor="loginEmail">Email:</label>
            <input type="email" id="loginEmail" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
            <label htmlFor="loginPassword">Password:</label>
            <input type="password" id="loginPassword" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
            <button type="submit">Login</button>
            <p className="message">{message}</p>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="form">
            <h2>Create Account</h2>

            <label>
              <input type="radio" value="customer" checked={signUpRole === 'customer'} onChange={() => setSignUpRole('customer')} />
              Customer
            </label>
            <label>
              <input type="radio" value="provider" checked={signUpRole === 'provider'} onChange={() => setSignUpRole('provider')} />
              Provider
            </label>

            <label htmlFor="firstName">First Name:</label>
            <input type="text" id="firstName" value={signUpFirstName} onChange={(e) => setSignUpFirstName(e.target.value)} required />
            <label htmlFor="lastName">Last Name:</label>
            <input type="text" id="lastName" value={signUpLastName} onChange={(e) => setSignUpLastName(e.target.value)} required />
            <label htmlFor="signUpEmail">Email:</label>
            <input type="email" id="signUpEmail" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} required />
            <label htmlFor="signUpPhone">Phone Number:</label>
            <input type="tel" id="signUpPhone" value={signUpPhone} pattern="^\d{8}$" minLength={8} maxLength={8} inputMode="numeric"
              onChange={(e) => setSignUpPhone(e.target.value.replace(/[^0-9]/g, ""))} required />

            <label htmlFor="signUpPassword">Password:</label>
            <input type="password" id="signUpPassword" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} required />
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />

            {signUpRole === 'provider' && (
              <>
                <label htmlFor="businessName">Business Name:</label>
                <input type="text" id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
                <label htmlFor="businessDescription">Business Description:</label>
                <textarea id="businessDescription" value={businessDescription} onChange={(e) => setBusinessDescription(e.target.value)} required />
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
