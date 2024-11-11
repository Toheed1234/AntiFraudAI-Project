import React, { useState, useContext } from 'react';
import { TokenContext } from '../TokenContext'; 
const Index = ({ onRouteChange }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const apiRequest = require('./api');
  const { setToken } = useContext(TokenContext);
  const handleLogin = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    try {
      const data = { "username": username, "password": password };
      const response = await apiRequest('http://localhost:8000/auth/login', 'POST', data);
      if (response.username){
        const token_data = { "username": username, "password": password };      
        var formBody = [];
        for (var property in token_data) {
          var encodedKey = encodeURIComponent(property);
          var encodedValue = encodeURIComponent(token_data[property]);
          formBody.push(encodedKey + "=" + encodedValue);}
        formBody = formBody.join("&");
      const token_response = await fetch('http://localhost:8000/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: formBody
      }).then(response => response.json())
        setToken(token_response.access_token);
        onRouteChange('/overview');
      }

    } catch (error) {
      console.error('Error during login:', error);
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className="form">
      <h2 className="title"><i>AI Fraud Detection System</i></h2>
      <form onSubmit={handleLogin}>
        <div className="container">
          <label htmlFor="uname"><b>Username</b></label>
          <input 
            type="text" 
            placeholder="Enter Username" 
            name="uname" 
            value={username}
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />

          <label htmlFor="psw"><b>Password</b></label>
          <input 
            type="password" 
            placeholder="● ● ● ● ● ● ● ● ● ● ● ● ●" 
            name="psw" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          
          <label>
            <input type="checkbox" name="keep" /> Keep me signed in
          </label>
          <button type="submit" style={{ maxWidth: '200px', width: 'auto' }}>Login</button>
          {error && <div className="error">{error}</div>}
        </div>

        <div className="container" style={{ backgroundColor: '#f1f1f1' }}>
          <button type="button" className="registerbtn" onClick={() => onRouteChange('/Register')} style={{ maxWidth: '200px', width: 'auto' }}>Register</button>
          <span className="psw"><a href="#" onClick={() => onRouteChange('/forgot-password')}>Forgot password?</a></span>
        </div>
      </form>
    </div>
  );
};

export default Index;
