import React, { useState } from 'react';
import styles from './Authpage.module.css';
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
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        {/* Header */}
        <div className={styles.authHeader}>
          <h1 className={styles.logo}>LocalConnect</h1>
          <p className={styles.tagline}>Connect with local services</p>
        </div>

        {/* Tab Switcher */}
        <div className={styles.tabSwitcher}>
          <button
            type="button"
            className={`${styles.tab} ${isLogin ? styles.activeTab : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            type="button"
            className={`${styles.tab} ${!isLogin ? styles.activeTab : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        {/* Message */}
        {message ? <div className={styles.message}>{message}</div> : null}

        {/* Forms */}
        {isLogin ? (
          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                className={styles.input}
                placeholder="Enter your email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Password</label>
              <input
                type="password"
                className={styles.input}
                placeholder="Enter your password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className={styles.form}>
            <div className={styles.nameRow}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>First Name</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="First name"
                  value={signUpFirstName}
                  onChange={(e) => setSignUpFirstName(e.target.value)}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Last Name</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Last name"
                  value={signUpLastName}
                  onChange={(e) => setSignUpLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                className={styles.input}
                placeholder="Enter your email"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Phone</label>
              <input
                type="tel"
                className={styles.input}
                placeholder="Enter your phone number"
                value={signUpPhone}
                onChange={(e) => setSignUpPhone(e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Password</label>
              <input
                type="password"
                className={styles.input}
                placeholder="Create a password"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Confirm Password</label>
              <input
                type="password"
                className={styles.input}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* Role Selector (UI only, uses existing signUpRole state) */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>I am a...</label>
              <div className={styles.roleSelector}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="role"
                    value="customer"
                    checked={signUpRole === 'customer'}
                    onChange={(e) => setSignUpRole(e.target.value)}
                  />
                  <span className={styles.radioText}>
                    <strong>Customer</strong>
                    <small>Looking for services</small>
                  </span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="role"
                    value="provider"
                    checked={signUpRole === 'provider'}
                    onChange={(e) => setSignUpRole(e.target.value)}
                  />
                  <span className={styles.radioText}>
                    <strong>Provider</strong>
                    <small>Offering services</small>
                  </span>
                </label>
              </div>
            </div>

            {/* Provider fields (UI only, already conditional on signUpRole) */}
            {signUpRole === 'provider' && (
              <div className={styles.providerFields}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Business Name</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Your business name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Business Description</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Tell us about your business..."
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}

            <button type="submit" className={styles.submitButton}>
              Sign Up
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
