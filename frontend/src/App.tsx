import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DocumentUploadList from './pages/DocumentUploadList';
import DocumentUploadForm from './pages/DocumentUploadForm';
import DatabaseIntegrationList from './pages/DatabaseIntegrationList';
import DatabaseIntegrationForm from './pages/DatabaseIntegrationForm';
import QueryFunctionalityList from './pages/QueryFunctionalityList';
import QueryFunctionalityForm from './pages/QueryFunctionalityForm';
import DocumentProcessingList from './pages/DocumentProcessingList';
import DocumentProcessingForm from './pages/DocumentProcessingForm';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/document-upload-list"
            element={
              <ProtectedRoute>
                <DocumentUploadList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/document-upload-form"
            element={
              <ProtectedRoute>
                <DocumentUploadForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/database-integration-list"
            element={
              <ProtectedRoute>
                <DatabaseIntegrationList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/database-integration-form"
            element={
              <ProtectedRoute>
                <DatabaseIntegrationForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/query-functionality-list"
            element={
              <ProtectedRoute>
                <QueryFunctionalityList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/query-functionality-form"
            element={
              <ProtectedRoute>
                <QueryFunctionalityForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/document-processing-list"
            element={
              <ProtectedRoute>
                <DocumentProcessingList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/document-processing-form"
            element={
              <ProtectedRoute>
                <DocumentProcessingForm />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;