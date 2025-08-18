import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="container-fluid">
            <div className="row justify-content-center">
              <div className="col-md-6">
                <div className="card mt-5">
                  <div className="card-body text-center">
                    <div className="mb-4">
                      <i className="fas fa-exclamation-triangle text-danger fa-3x"></i>
                    </div>
                    <h3 className="text-danger mb-3">Something went wrong</h3>
                    <p className="text-muted mb-4">
                      We're sorry, but something unexpected happened. Please try refreshing the page.
                    </p>
                    <button 
                      className="btn btn-primary me-2"
                      onClick={() => window.location.reload()}
                    >
                      <i className="fas fa-redo me-2"></i>
                      Refresh Page
                    </button>
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => window.history.back()}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      Go Back
                    </button>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                      <details className="mt-4 text-start">
                        <summary>Error Details (Development)</summary>
                        <pre className="bg-secondary bg-opacity-10 p-3 mt-2 rounded" style={{ fontSize: '0.8rem' }}>
                          {this.state.error && this.state.error.toString()}
                          <br />
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 