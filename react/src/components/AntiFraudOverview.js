import React, { useContext, useState, useEffect } from 'react';
import { TokenContext } from '../TokenContext'; // Assuming TokenContext.js is in the same directory

const fetchTransactions = async (token) => {
  // Mocking the API request
  const response = await fetch('http://localhost:8000/transactions', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`, // Assuming the token is used for authorization
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

const AntiFraudOverview = () => {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const { token } = useContext(TokenContext);

  useEffect(() => {
    fetchTransactions(token)
      .then(data => setTransactions(data))
      .catch(error => setError(error.message));
  }, [token]);

  return (
    <div>
      <div id="SidePannel">
        <h2>AI Fraud<br /> Detection</h2>
        <div className="active">
          <button type="button" onClick={() => window.location.href = '/overview'}>Overview</button><br />
        </div>
        <div className="inactive">
          <button type="button" onClick={() => window.location.href = '/transactions'}>Transactions</button><br />
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
        <table id="LargeTable">
          <thead>
            <tr>
              <th>Recent Transactions</th>
            </tr>
            <tr>
              <th>TRANSACTION DATE</th>
              <th>TRANSACTION ID</th>
              <th>TRANSACTION AMOUNT HUF</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={index}>
                <td>{transaction.creation_date}</td>
                <td>{transaction.id}</td>
                <td>{transaction.amount}</td>
                <td>
                  <button className={transaction.status === 'ACCEPTED' ? 'approve' : 'reject'}>
                    {transaction.status}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button id="GenReportLarge" onClick={() => generateReport(token)}>Generate Report</button>
      </div>
    </div>
  );
};

export default AntiFraudOverview;
