import React, { useState, useContext } from 'react';
import { TokenContext } from '../TokenContext'; // Assuming TokenContext.js is in the same directory
import './styles.css'; // Import the common styles

const addItem = async (item, token) => {
  const response = await fetch('http://localhost:8000/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(item),
  });
  if (!response.ok) {
    throw new Error('Failed to add item');
  }
  return response.json();
};

const AddItem = ({ onRouteChange }) => {
  const { token } = useContext(TokenContext);
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
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

  const handleAddItem = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    // Basic validation
    if (!name || !value) {
      setError('All fields are required');
      return;
    }
    if (isNaN(value)) {
      setError('Value must be a number');
      return;
    }
    
    try {
      const newItem = { name, value: parseFloat(value), transactions: [] };
      await addItem(newItem, token);
      setMessage('Item added successfully!');
      setName('');
      setValue('');
    } catch (error) {
      setError('Failed to add item. Please try again.');
      console.error('Error adding item:', error);
    }
  };

  return (
    <div>
      <div id="SidePannel">
        <h2>AI Fraud<br /> Detection</h2>
        <div className="inactive">
          <button type="button" onClick={() => window.location.href = '/overview'}>Overview</button><br />
        </div>
        <div className="inactive">
          <button type="button" onClick={() => window.location.href = '/transactions'}>Transactions</button><br />
          <button type="button" onClick={() => window.location.href = '/pending'}>Pending Transactions</button><br />
        </div>
        <div className="inactive">
          <button type="button" onClick={() => window.location.href = '/detection'}>Detection Reports</button><br />
        </div>
        <div className="inactive">
          <button type="button" onClick={() => window.location.href = '/buyers'}>Buyers</button><br />
          <button type="button" onClick={() => window.location.href = '/add-buyer'}>Add Buyer</button><br />
          <button type="button" onClick={() => window.location.href = '/items'}>Items</button><br />
        </div>
        <div className="active">
            <button type="button" onClick={() => window.location.href = '/add-item'}>Add Item</button><br />
        </div>
        <div className="inactive">
            <button type="button" onClick={() => window.location.href = '/add-transaction'}>Add Transaction</button><br />
        </div>
        <div id="logout">
          <button type="button" onClick={() => window.location.href = '/index'}>Logout</button>
        </div>
      </div>

      <div>
        <h2 className="title"><i>AI Fraud Detection System</i></h2>
        <form onSubmit={handleAddItem}>
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
              <label htmlFor="value"><b>Value</b></label>
              <input 
                type="text" 
                placeholder="Enter Value" 
                name="value" 
                value={value} 
                onChange={(e) => setValue(e.target.value)} 
                required 
                style={inputStyle} 
              />
            </div>
            {error && <p className="error">{error}</p>}
            {message && <p className="message">{message}</p>}
            <button type="submit" style={{ maxWidth: '200px', width: 'auto' }}>Add Item</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItem;
