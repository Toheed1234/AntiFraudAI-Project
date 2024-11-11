import React, { useState } from 'react';
import './App.css';
import AntiFraudOverview from './components/AntiFraudOverview';
import ForgotPassword from './components/ForgotPassword';
import Transactions from './components/Transactions';
import PendingTransactions from './components/PendingTransactions';
import ResetEmailSent from './components/ResetEmailSent';
import Index from './components/Index';
import DetectionReports from './components/DetectionReports';
import Register from './components/Register';
import Buyers from './components/Buyers';
import AddBuyer from './components/AddBuyer';
import Items from './components/Items';
import AddItem from './components/AddItem';
import AddTransaction from './components/AddTransaction';
import { TokenProvider } from './TokenContext'; // Import the TokenProvider

function App() {
  const [currentRoute, setCurrentRoute] = useState(window.location.pathname);
  const [token, setToken] = useState(null); // State to hold the token

  const handleRouteChange = (route) => {
    setCurrentRoute(route);
    window.history.pushState({}, '', route);
  };

  const getMainComponent = () => {
    switch (currentRoute) {
      case '/index':
        return <Index onRouteChange={handleRouteChange} setToken={setToken} />;
      case '/overview':
        return <AntiFraudOverview />;
      case '/forgot-password':
        return <ForgotPassword />;
      case '/transactions':
        return <Transactions />;
      case '/pending':
        return <PendingTransactions />;
      case '/reset-email-sent':
        return <ResetEmailSent />;
      case '/detection':
        return <DetectionReports />;
      case '/buyers':
        return <Buyers />;
      case '/add-buyer':
        return <AddBuyer />;
      case '/items':
        return <Items />;
      case '/add-item':
        return <AddItem />;
      case '/add-transaction':
        return <AddTransaction />;
      case '/Register':
        return <Register onRouteChange={handleRouteChange} />;
      default:
        return <Index onRouteChange={handleRouteChange} setToken={setToken} />;
    }
  };

  return (
    <div className="App">
      {/* Wrap the entire application with the TokenProvider */}
      <TokenProvider>
        {getMainComponent()}
      </TokenProvider>
    </div>
  );
}

export default App;
