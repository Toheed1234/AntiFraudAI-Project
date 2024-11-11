import React, { useState, useEffect, useContext } from 'react';
import { TokenContext } from '../TokenContext'; // Assuming TokenContext.js is in the same directory
import './styles.css'; // Import the common styles

const fetchBuyers = async (token) => {
  const response = await fetch('http://localhost:8000/buyers', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch buyers');
  }
  return response.json();
};

const Buyers = () => {
  const { token } = useContext(TokenContext);
  const [buyers, setBuyers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBuyers(token)
      .then(data => setBuyers(data))
      .catch(error => setError(error.message));
  }, [token]);

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
        <div className="active">
          <button type="button" onClick={() => window.location.href = '/buyers'}>Buyers</button><br />
        </div>
        <div className="inactive">
          <button type="button" onClick={() => window.location.href = '/add-buyer'}>Add Buyer</button><br />
          <button type="button" onClick={() => window.location.href = '/items'}>Items</button><br />
          <button type="button" onClick={() => window.location.href = '/add-transaction'}>Add Transaction</button><br />
        </div>
        <div id="logout">
          <button type="button" onClick={() => window.location.href = '/index'}>Logout</button>
        </div>
      </div>

      <div>
        <h2 id="tittle">Buyers</h2>

        <table id="SingleTable">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {buyers.map((buyer, index) => (
              <tr key={index}>
                <td>{buyer.id}</td>
                <td>{buyer.name}</td>
                <td>{buyer.email}</td>
                <td>{buyer.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Buyers;
