import React from 'react';
import './styles.css'; // Import the common styles

const ForgotPassword = () => {
  const handlePasswordReset = () => {
    // Simulating API call
    setTimeout(() => {
      window.location.href = '/reset-email-sent';
    }, 1000); // Simulating 1 second delay
  };

  const handleBackToLogin = () => {
    window.location.href = '/index';
  };

  return (
    <div className="form">
      <h2 className="title"><i>AI Fraud Detection System</i></h2>
      <h2><b>Forgot Password?</b></h2>
      <p>Enter your email address to get the<br />password reset link.</p>
      <form>
        <div className="container">
          <label htmlFor="uname"><b>Email Address</b></label>
          <input type="text" placeholder="hello@example.com" name="uname" required />
          <button type="button" onClick={handlePasswordReset}>Password Reset</button>
          <button type="button" className="back" onClick={handleBackToLogin}>Back to login</button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
