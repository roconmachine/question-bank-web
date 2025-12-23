import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import Header from 'app/common/header';
import ErrorBoundary from 'app/error/error-boundary';
import './app.css';
import AuthProvider from './login/auth-provider';
import HeaderPublic from './common/header-public';
import isLoggedIn from './utils/utils';



/**
 * Provide the app layout and some general functionality.
 */
export default function App() {
  const location = useLocation();
  const [msgSuccess, setMsgSuccess] = useState<string | null>(location.state?.msgSuccess || null);
  const [msgInfo, setMsgInfo] = useState<string | null>(location.state?.msgInfo || null);
  const [msgError, setMsgError] = useState<string | null>(location.state?.msgError || null);

  // Update messages when navigation supplies new location.state
  useEffect(() => {
    setMsgSuccess(location.state?.msgSuccess || null);
    setMsgInfo(location.state?.msgInfo || null);
    setMsgError(location.state?.msgError || null);
  }, [location.state]);

  useEffect(() => {
    if (msgSuccess) {
      const timer = setTimeout(() => setMsgSuccess(null), 10000);
      return () => clearTimeout(timer);
    }
    return;
  }, [msgSuccess]);

  useEffect(() => {
    if (msgInfo) {
      const timer = setTimeout(() => setMsgInfo(null), 10000);
      return () => clearTimeout(timer);
    }
    return;
  }, [msgInfo]);

  useEffect(() => {
    if (msgError) {
      const timer = setTimeout(() => setMsgError(null), 10000);
      return () => clearTimeout(timer);
    }
    return;
  }, [msgError]);

  return (<>
    <div className="bg-gray-50 flex items-right justify-between p-4">
      {isLoggedIn() ? <Header /> :  <HeaderPublic />}
      {/* <HeaderPublic /> */}
      <AuthProvider />
    </div>
   
    <main>
      <div className="container mx-auto px-4 md:px-6">
        {msgSuccess && (
          <div className="bg-green-200 border-green-800 text-green-800 border rounded p-4 mb-6 flex justify-between items-center" role="alert">
            <span>{msgSuccess}</span>
            <button
              onClick={() => setMsgSuccess(null)}
              className="text-green-800 hover:text-green-900 text-xl font-bold"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}
        {msgInfo && (
          <div className="bg-blue-200 border-blue-800 text-blue-800 border rounded p-4 mb-6 flex justify-between items-center" role="alert">
            <span>{msgInfo}</span>
            <button
              onClick={() => setMsgInfo(null)}
              className="text-blue-800 hover:text-blue-900 text-xl font-bold"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}
        {msgError && (
          <div className="bg-red-200 border-red-800 text-red-800 border rounded p-4 mb-6 flex justify-between items-center" role="alert">
            <span>{msgError}</span>
            <button
              onClick={() => setMsgError(null)}
              className="text-red-800 hover:text-red-900 text-xl font-bold"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}
        <ErrorBoundary>
          <Outlet/>
        </ErrorBoundary>
      </div>
    </main>
  </>);
}
