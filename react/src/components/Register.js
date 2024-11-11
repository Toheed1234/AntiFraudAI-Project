import React, { useState } from 'react';

const Register = ({ onRouteChange }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const apiRequest = require('./api');

  const inputStyle = {
    width: '100%',
    height: '40px', 
    boxSizing: 'border-box', 
    padding: '8px',  
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginBottom: '8px',
  };

  const handleSignUp = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    // Basic validation
    if (!email || !username || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
        const data = {
          "username": username,
          "password": password,
          'email': email,
          "balance": 100,
          "name": username
        };
        const response = await apiRequest('http://localhost:8000/auth/register', 'POST', data);
        // Redirect to the Overview page after successful sign-up
        onRouteChange('/index');
      } catch (error) {
        setError('Sign up failed. Please try again.');
        console.error('Error signing up:', error);
      }

  };

  return (
    <div className="form">
      <h2 className="title"><i>AI Fraud Detection System</i></h2>
      <form onSubmit={handleSignUp}>
        <div className="container">
          <div>
            <label htmlFor="email"><b>Email</b></label>
            <input type="email" placeholder="Enter Email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          </div>
          <div>
            <label htmlFor="uname"><b>Username</b></label>
            <input type="text" placeholder="Enter Username" name="uname" value={username} onChange={(e) => setUsername(e.target.value)} required style={inputStyle} />
          </div>
          <div>
            <label htmlFor="psw"><b>Password</b></label>
            <input type="password" placeholder="● ● ● ● ● ● ● ● ● ● ● ● ●" name="psw" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
          </div>
          <div>
            <label htmlFor="confirmPsw"><b>Confirm Password</b></label>
            <input type="password" placeholder="● ● ● ● ● ● ● ● ● ● ● ● ●" name="confirmPsw" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={inputStyle} />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" style={{ maxWidth: '200px', width: 'auto' }}>Sign Up</button>
        </div>

        <div className="container" style={{ backgroundColor: '#f1f1f1' }}>
          <button type="button" className="cancelbtn" onClick={() => onRouteChange('/home')} style={{ maxWidth: '200px', width: 'auto' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default Register;
