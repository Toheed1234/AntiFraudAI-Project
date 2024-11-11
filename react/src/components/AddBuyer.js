import React, { useState, useContext } from 'react';
import { TokenContext } from '../TokenContext'; // Assuming TokenContext.js is in the same directory
import './styles.css'; // Import the common styles

const addBuyer = async (buyer, token) => {
  const response = await fetch('http://localhost:8000/buyers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(buyer),
  });
  if (!response.ok) {
    throw new Error('Failed to add buyer');
  }
  return response.json();
};

const AddBuyer = ({ onRouteChange }) => {
  const { token } = useContext(TokenContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const inputStyle = {
    width: '40%',
    height: '40px', 
    boxSizing: 'border-box', 
    padding: '8px',  
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginBottom: '8px',
  };

  const handleAddBuyer = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    // Basic validation
    if (!name || !email || !address) {
      setError('All fields are required');
      return;
    }
    
    try {
      const newBuyer = { name, email, address};
      await addBuyer(newBuyer, token);
      setMessage('Buyer added successfully!');
      setName('');
      setEmail('');
      setAddress('');
    } catch (error) {
      setError('Failed to add buyer. Please try again.');
      console.error('Error adding buyer:', error);
    }
  };

  return (
    <div>
      <div id="SidePannel">
        <h2>AI Fraud<br /> Detection</h2>
        <div className="inactive">
          <button type="button" onClick={() => window.location.href = '/overview'}>Overview</button><br />
          <button type="button" onClick={() => window.location.href = '/transactions'}>Transactions</button><br />
        </div>
        <div className="inactive">
          <button type="button" onClick={() => window.location.href = '/pending'}>Pending Transactions</button><br />
        </div>
        <div className="inactive">
          <button type="button" onClick={() => window.location.href = '/detection'}>Detection Reports</button><br />
        </div>
        <div className="inactive">
          <button type="button" onClick={() => window.location.href = '/buyers'}>Buyers</button><br />
        </div>
        <div className="active">
            <button type="button" onClick={() => window.location.href = '/add-buyer'}>Add Buyer</button><br />
        </div>
        <div className="inactive">
            <button type="button" onClick={() => window.location.href = '/items'}>Items</button><br />
            <button type="button" onClick={() => window.location.href = '/add-transaction'}>Add Transaction</button><br />
        </div>
        <div id="logout">
          <button type="button" onClick={() => window.location.href = '/index'}>Logout</button>
        </div>
      </div>

      <div>
        <h2 className="title"><i>AI Fraud Detection System</i></h2>
        <form onSubmit={handleAddBuyer}>
          <div className="container">
            <div>
              <label htmlFor="name"><b>Name</b></label>
              <input 
                type="text" 
                placeholder="Enter Name" 
                name="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                style={inputStyle} 
              />
            </div>
            <div>
              <label htmlFor="email"><b>Email</b></label>
              <input 
                type="email" 
                placeholder="Enter Email" 
                name="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                style={inputStyle} 
              />
            </div>
            <div>
              <label htmlFor="address"><b>Address</b></label>
              <input 
                type="text" 
                placeholder="Enter Address" 
                name="address" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                required 
                style={inputStyle} 
              />
            </div>
            {error && <p className="error">{error}</p>}
            {message && <p className="message">{message}</p>}
            <button type="submit" style={{ maxWidth: '200px', width: 'auto' }}>Add Buyer</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBuyer;
