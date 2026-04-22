import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Products from './pages/Products';
import ProductFormPage from './pages/ProductFormPage';
import Layout from './components/Layout';
import Register from './pages/Register';
import IssueWIO from './pages/IssueWIO';
import IssueList from './pages/IssueList';
import IndentAdd from './pages/IndentAdd';
import IndentList from './pages/IndentList';
import POAdd from './pages/POAdd';
import POList from './pages/POList';
import VendorAdd from './pages/VendorAdd';
import VendorList from './pages/VendorList';
import GateEntryList from './pages/GateEntryList';
import GateVerification from './pages/GateVerification';
import GateEntryDetail from './pages/GateEntryDetail';
import ReorderListing from './pages/ReorderListing';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/register" element={<Layout><Register /></Layout>} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/categories" element={<Layout><Categories /></Layout>} />
            <Route path="/products" element={<Layout><Products /></Layout>} />
            <Route path="/products/add" element={<Layout><ProductFormPage /></Layout>} />
            <Route path="/products/edit/:id" element={<Layout><ProductFormPage /></Layout>} />
            <Route path="/reorder-products" element={<Layout><ReorderListing /></Layout>} />
            <Route path="/issue" element={<Layout><IssueWIO /></Layout>} />
            <Route path="/issue/list" element={<Layout><IssueList /></Layout>} />
            <Route path="/indent/add" element={<Layout><IndentAdd /></Layout>} />
            <Route path="/indent/list" element={<Layout><IndentList /></Layout>} />
            <Route path="/po/add" element={<Layout><POAdd /></Layout>} />
            <Route path="/po/list" element={<Layout><POList /></Layout>} />
            <Route path="/vendors" element={<Layout><VendorList /></Layout>} />
            <Route path="/vendors/add" element={<Layout><VendorAdd /></Layout>} />
            <Route path="/gate-entry" element={<Layout><GateEntryList /></Layout>} />
            <Route path="/gate-entry/verify" element={<Layout><GateVerification /></Layout>} />
            <Route path="/gate-entry/:id" element={<Layout><GateEntryDetail /></Layout>} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
