import React, { useState, useEffect, useContext } from 'react';
import { TokenContext } from '../TokenContext'; // Assuming TokenContext.js is in the same directory
import './styles.css'; // Import the common styles

const fetchItems = async (token, transactionId) => {
  const response = await fetch(`http://localhost:8000/transactions/${transactionId}/items`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch items');
  }
  return response.json();
};

const Items = () => {
  const { token } = useContext(TokenContext);
  const transactionId = 1; // Set transactionId to 3 as requested
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItems(token, transactionId)
      .then(data => setItems(data))
      .catch(error => setError(error.message));
  }, [token]); // Only token is included in the dependency array

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
        </div>
        <div className="active">
          <button type="button" onClick={() => window.location.href = '/items'}>Items</button><br />
        </div>
        <div className="inactive">
          <button type="button" onClick={() => window.location.href = '/add-transaction'}>Add Transaction</button><br />
        </div>
        <div className="inactive">
        </div>
        <div id="logout">
          <button type="button" onClick={() => window.location.href = '/index'}>Logout</button>
        </div>
      </div>

      <div>
        <h2 id="title">Items</h2>

        <table id="SingleTable">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Value</th>
              <th>Transaction ID</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.value}</td>
                <td>{item.transaction_id}</td> {/* Displaying transaction_id */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Items;
