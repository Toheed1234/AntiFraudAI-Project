import React, { useContext, useState, useEffect } from 'react';
import { TokenContext } from '../TokenContext'; // Assuming TokenContext.js is in the same directory
import './styles.css'; // Import the common styles

const fetchPendingTransactions = async (token) => {
  const response = await fetch('http://localhost:8000/buyers/2/transactions/pending', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch pending transactions');
  }
  return response.json();
};

const approveTransaction = async (transactionId, token) => {
  const response = await fetch(`http://localhost:8000/transactions/${transactionId}/accept`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to approve transaction');
  }
};

const rejectTransaction = async (transactionId, token) => {
  const response = await fetch(`http://localhost:8000/transactions/${transactionId}/reject`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to reject transaction');
  }
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

const PendingTransactions = () => {
  const { token } = useContext(TokenContext);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPendingTransactions(token)
      .then(data => setTransactions(data))
      .catch(error => setError(error.message));
  }, [token]);

  const handleApprove = async (transactionId) => {
    try {
      await approveTransaction(transactionId, token);
      const updatedTransactions = transactions.filter(transaction => transaction.id !== transactionId);
      setTransactions(updatedTransactions);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleReject = async (transactionId) => {
    try {
      await rejectTransaction(transactionId, token);
      const updatedTransactions = transactions.filter(transaction => transaction.id !== transactionId);
      setTransactions(updatedTransactions);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGenerateReport = () => {
    generateReport(token);
  };

  return (
    <div>
      <div id="SidePannel">
      <h2>AI Fraud<br /> Detection</h2>
        <div className="inactive">
          <button type="button" onClick={() => window.location.href = '/overview'}>Overview</button><br />
          <button type="button" onClick={() => window.location.href = '/transactions'}>Transactions</button><br /> 

        </div>
        <div className="active">
          <button type="button" onClick={() => window.location.href = '/pending'}>Pending Transactions</button><br />

        </div>
        <div className="inactive">
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
        <h2 id="tittle">Pending Transactions</h2>

        {error && <p className="error">{error}</p>}

        <table id="SingleTable">
          <thead>
            <tr>
              <th>Items</th>
              <th>Buyer id</th>
              <th>Creation Date</th>
              <th>Amount</th>
              <th>Action</th>
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
                <td>
                  <button className="reject" onClick={() => handleReject(transaction.id)}>Reject</button>
                  <button className="approve" onClick={() => handleApprove(transaction.id)}>Approve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button id="GenReport" onClick={handleGenerateReport}>Generate Report</button>
      </div>
    </div>
  );
};

export default PendingTransactions;
