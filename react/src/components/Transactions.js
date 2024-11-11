import React, { useContext, useState, useEffect } from 'react';
import { TokenContext } from '../TokenContext'; // Assuming TokenContext.js is in the same directory
import './styles.css'; // Import the common styles

const fetchTransactions = async (token) => {
  const response = await fetch('http://localhost:8000/transactions', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return response.json();
};

const generateReport = async (token) => {
  const startDate = '2024-06-01';
  const endDate = '2024-06-03';

  try {
    const response = await fetch(`http://localhost:8000/generate-report?start_date=${startDate}&end_date=${endDate}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to generate report');
    }

    // Handle the successful report generation
    // For example, you can display a success message or handle the generated report data
    console.log('Report generated successfully');
  } catch (error) {
    // Handle errors
    console.error('Error generating report:', error.message);
  }
};

const Transactions = () => {
  const { token } = useContext(TokenContext);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactions(token)
      .then(data => setTransactions(data))
      .catch(error => setError(error.message));
  }, [token]);

  const handleGenerateReport = () => {
    generateReport(token);
  };

  return (
    <div>
      <div id="SidePannel">
      <h2>AI Fraud<br /> Detection</h2>
        <div className="inactive">
          <button type="button" onClick={() => window.location.href = '/overview'}>Overview</button><br />
        </div>
        <div className="active">
          <button type="button" onClick={() => window.location.href = '/transactions'}>Transactions</button><br /> 
          
        </div>
        <div className="inactive">
          <button type="button" onClick={() => window.location.href = '/pending'}>Pending Transactions</button><br />
          <button type="button" onClick={() => window.location.href = '/detection'}>Detection Reports</button><br />
          <button type="button" onClick={() => window.location.href = '/buyers'}>Buyers</button><br />
          <button type="button" onClick={() => window.location.href = '/add-buyer'}>Add Buyer</button><br />
          <button type="button" onClick={() => window.location.href = '/items'}>Items</button><br />
          <button type="button" onClick={() => window.location.href = '/add-transaction'}>Add Transaction</button><br />
        </div>
        <div className="inactive">
        </div>
        <div id="logout">
          <button type="button" onClick={() => window.location.href = '/index'}>Logout</button>
        </div>
      </div>

      <div>
        <h2 id="tittle">Recent Transactions</h2>

        {error && <p className="error">{error}</p>}

        <table id="SingleTable">
          <thead>
            <tr>
              <th>Items</th>
              <th>Buyer id</th>
              <th>DATE</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={index}>
                <td>
                  {transaction.items.map(item => (
                    <div key={item.id}>{item.name}</div>
                  ))}
                </td>
                <td>{transaction.buyer_id}</td>
                <td>{transaction.creation_date}</td>
                <td>{transaction.amount}</td>
                <td><button className={transaction.status === 'ACCEPTED' ? 'approve' : 'reject'}>
                    {transaction.status}</button></td>
              </tr>
            ))}
          </tbody>
        </table>

        <button id="GenReport" onClick={handleGenerateReport}>Generate Report</button>
      </div>
    </div>
  );
};

export default Transactions;
