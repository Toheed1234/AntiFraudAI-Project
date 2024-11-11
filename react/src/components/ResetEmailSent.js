import React from 'react';
import './styles.css'; // Import the common styles

const ResetEmailSent = () => {
  return (
    <div className="form">
      <h2 className="title"><i>AI Fraud Detection System</i></h2>
      <h2><b>Reset Email Sent!</b></h2>
      <p>An email with your password reset<br />information has been sent to your<br />
        entered email address.</p>
      <div className="container">
        <button 
          type="button" 
          className="back" 
          onClick={() => window.location.href = '/index'} 
          style={{ maxWidth: '200px', width: 'auto' }}
        >
          Back to login
        </button>
      </div>
    </div>
  );
};

export default ResetEmailSent;
