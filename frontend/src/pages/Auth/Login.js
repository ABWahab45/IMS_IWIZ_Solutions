import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    

    
    const result = await login(formData.email, formData.password);
    

    
    if (result.success) {
      toast.success('Login successful! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000);
    } else {
      // Show error message to user
      if (result.message.includes('Too many login attempts')) {
        toast.error('Too many login attempts. Please wait 15 minutes before trying again, or contact an administrator for immediate access.');
      } else {
        toast.error(`Login failed: ${result.message}`);
      }
    }
    
    setIsSubmitting(false);
  };

  if (loading) {
    return <LoadingSpinner overlay />;
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center login-container">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0 login-card">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="mb-2">
                    <img 
                      src="/iwizlogo.png" 
                      alt="IWIZ Solutions" 
                      style={{ 
                        height: '120px', 
                        width: 'auto',
                        marginBottom: '0.5rem'
                      }} 
                    />
                  </div>
                  <p className="text-muted mb-0 login-subtitle">Inventory Management System</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-medium mb-2 login-label">
                      Email Address
                    </label>
                    <div className="input-wrapper">
                      <i className="fas fa-envelope input-icon-left"></i>
                      <input
                        type="email"
                        className="form-control modern-input"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                        autoComplete="email"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-medium mb-2 login-label">
                      Password
                    </label>
                    <div className="input-wrapper">
                      <i className="fas fa-lock input-icon-left"></i>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control modern-input"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="input-icon-right"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="d-grid mb-3">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg login-button"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Signing In...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </div>

                  <div className="text-center">
                    <p className="text-muted mb-0 login-help-text">
                      Need help? Contact your system administrator
                    </p>
                  </div>
                </form>
              </div>
            </div>

            <div className="text-center mt-4">
              <p className="text-muted small login-footer">
                © 2025 IWIZ Solutions. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          background-color: var(--bg-secondary);
          color: var(--text-primary);
        }

        .login-card {
          background-color: var(--bg-card);
          border-radius: 20px;
          border: 1px solid var(--border-color);
        }

        .login-subtitle {
          color: var(--text-muted) !important;
        }

        .login-label {
          color: var(--text-primary);
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .login-help-text {
          color: var(--text-muted) !important;
        }

        .login-footer {
          color: var(--text-muted) !important;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .modern-input {
          height: 50px;
          border: 2px solid var(--border-color);
          border-radius: 12px;
          padding: 12px 45px 12px 45px;
          font-size: 16px;
          background-color: var(--bg-primary);
          color: var(--text-primary);
          transition: all 0.3s ease;
          width: 100%;
        }

        .modern-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          background-color: var(--bg-primary);
        }

        .modern-input::placeholder {
          color: var(--text-muted);
          font-size: 16px;
        }

        .input-icon-left {
          position: absolute;
          left: 16px;
          color: var(--text-muted);
          font-size: 18px;
          z-index: 2;
          pointer-events: none;
        }

        .input-icon-right {
          position: absolute;
          right: 16px;
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          transition: color 0.3s ease;
        }

        .input-icon-right:hover {
          color: var(--primary-color);
        }

        .login-button {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
          border: none;
          border-radius: 12px;
          height: 50px;
          font-weight: 600;
          font-size: 16px;
          transition: all 0.3s ease;
          color: var(--text-inverse);
        }

        .login-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
          color: var(--text-inverse);
        }

        .login-button:focus {
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          color: var(--text-inverse);
        }

        .login-button:disabled {
          opacity: 0.7;
          transform: none;
          box-shadow: none;
        }

        .card-body {
          padding: 3rem;
        }

        @media (max-width: 768px) {
          .card-body {
            padding: 2rem;
          }
        }

        /* Dark mode specific adjustments */
        [data-theme="dark"] .modern-input {
          border-color: var(--border-color);
        }

        [data-theme="dark"] .modern-input:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }

        [data-theme="dark"] .input-icon-left,
        [data-theme="dark"] .input-icon-right {
          color: var(--text-muted);
        }

        [data-theme="dark"] .input-icon-right:hover {
          color: var(--primary-color);
        }
      `}</style>
    </div>
  );
};

export default Login;