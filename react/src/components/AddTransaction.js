import React, { useContext, useState } from 'react';
import { TokenContext } from '../TokenContext'; // Adjust the path if necessary
import './styles.css'; // Import the common styles

const addTransaction = async (transaction, token) => {
  const response = await fetch('http://localhost:8000/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      amount: transaction.amount,
      buyer_id: transaction.buyer_id,
      items: transaction.items.map(item => ({
        name: item.name,
        value: item.value
      }))
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to add transaction');
  }
  return response.json();
};


const AddTransaction = ({ onRouteChange }) => {
  const { token } = useContext(TokenContext);
  const [amount, setAmount] = useState('');
  const [buyerId, setBuyerId] = useState('');
  const [items, setItems] = useState([{ name: '', value: '' }]);
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

  const handleAddTransaction = async (event) => {
    event.preventDefault();

    // Basic validation
    if (!amount || !buyerId || items.some(item => !item.name || !item.value)) {
      setError('All fields are required');
      return;
    }
    if (isNaN(amount) || items.some(item => isNaN(item.value))) {
      setError('Amount and Item Values must be numbers');
      return;
    }

    try {
      const newTransaction = {
        amount: parseFloat(amount),
        buyer_id: parseInt(buyerId),
        items: items.map(item => ({
          name: item.name,
          value: parseFloat(item.value)
        })),
      };
      await addTransaction(newTransaction, token);
      setMessage('Transaction added successfully!');
      setAmount('');
      setBuyerId('');
      setItems([{ name: '', value: '' }]);
    } catch (error) {
      setError('Failed to add transaction. Please try again.');
      console.error('Error adding transaction:', error);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItemField = () => {
    setItems([...items, { name: '', value: '' }]);
  };

  return (
    <div>
      <div id="SidePannel">
        <h2>AI Fraud<br /> Detection</h2>
        <div className="inactive">
          <button type="button" onClick={() => window.location.href = '/overview'}>Overview</button><br />
          <button type="button" onClick={() => window.location.href = '/transactions'}>Transactions</button><br />
          <button type="button" onClick={() => window.location.href = '/pending'}>Pending Transactions</button><br />
          <button type="button" onClick={() => window.location.href = '/detection'}>Detection Reports</button><br />
          <button type="button" onClick={() => window.location.href = '/buyers'}>Buyers</button><br />
          <button type="button" onClick={() => window.location.href = '/add-buyer'}>Add Buyer</button><br />
          <button type="button" onClick={() => window.location.href = '/items'}>Items</button><br />
        </div>
        <div className="active">
          <button type="button" onClick={() => window.location.href = '/add-transaction'}>Add Transaction</button><br />
        </div>
        <div id="logout">
          <button type="button" onClick={() => window.location.href = '/index'}>Logout</button>
        </div>
      </div>

      <div>
        <h2 className="title"><i>Add New Transaction</i></h2>
        <form onSubmit={handleAddTransaction}>
          <div className="container">
            <div>
              <label htmlFor="amount"><b>Amount</b></label>
              <input 
                type="text" 
                placeholder="Enter Amount" 
                name="amount" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                required 
                style={inputStyle} 
              />
            </div>
            <div>
              <label htmlFor="buyerId"><b>Buyer ID</b></label>
              <input 
                type="text" 
                placeholder="Enter Buyer ID" 
                name="buyerId" 
                value={buyerId} 
                onChange={(e) => setBuyerId(e.target.value)} 
                required 
                style={inputStyle} 
              />
            </div>
            {items.map((item, index) => (
              <div key={index}>
                <div>
                <label htmlFor={`itemName-${index}`}><b>Item Name</b></label>
                <input 
                  type="text" 
                  placeholder="Enter Item Name" 
                  name={`itemName-${index}`} 
                  value={item.name} 
                  onChange={(e) => handleItemChange(index, 'name', e.target.value)} 
                  required 
                  style={inputStyle} 
                />
                </div>
                <label htmlFor={`itemValue-${index}`}><b>Item Value</b></label>
                <input 
                  type="text" 
                  placeholder="Enter Item Value" 
                  name={`itemValue-${index}`} 
                  value={item.value} 
                  onChange={(e) => handleItemChange(index, 'value', e.target.value)} 
                  required 
                  style={inputStyle} 
                />
              </div>
            ))}
            <button type="button" onClick={addItemField} style={{ maxWidth: '200px', width: 'auto', marginBottom: '8px' }}>Add Another Item</button>
            {error && <p className="error">{error}</p>}
            {message && <p className="message">{message}</p>}
            <button type="submit" style={{ maxWidth: '200px', width: 'auto' }}>Add Transaction</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransaction;
