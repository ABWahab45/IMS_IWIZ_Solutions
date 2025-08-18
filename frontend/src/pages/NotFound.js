import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container-fluid">
      <div className="row justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="col-md-6 text-center">
          <div className="error-page">
            <div className="error-code mb-4">
              <h1 className="display-1 text-primary fw-bold">404</h1>
            </div>
            
            <div className="error-content">
              <h2 className="h3 mb-3">Page Not Found</h2>
              <p className="text-muted mb-4">
                Sorry, the page you are looking for doesn't exist or has been moved.
              </p>
              
              <div className="error-actions">
                <Link to="/dashboard" className="btn btn-primary me-3">
                  <i className="fas fa-home me-2"></i>
                  Go to Dashboard
                </Link>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => window.history.back()}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Go Back
                </button>
              </div>
            </div>
            
            <div className="error-illustration mt-5">
              <i className="fas fa-search fa-5x text-muted opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row justify-content-center mt-5">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Quick Navigation</h5>
              <div className="row">
                <div className="col-md-3 mb-3">
                  <Link to="/dashboard" className="text-decoration-none">
                    <div className="d-flex align-items-center p-2 rounded hover-bg-secondary">
                      <i className="fas fa-chart-line text-primary me-3"></i>
                      <span>Dashboard</span>
                    </div>
                  </Link>
                </div>
                <div className="col-md-3 mb-3">
                  <Link to="/inventory" className="text-decoration-none">
                    <div className="d-flex align-items-center p-2 rounded hover-bg-secondary">
                      <i className="fas fa-box text-success me-3"></i>
                      <span>Inventory</span>
                    </div>
                  </Link>
                </div>
                <div className="col-md-3 mb-3">
                  <Link to="/users" className="text-decoration-none">
                    <div className="d-flex align-items-center p-2 rounded hover-bg-secondary">
                      <i className="fas fa-users text-warning me-3"></i>
                      <span>Users</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;