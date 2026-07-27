import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 text-slate-100">
          <div className="glass max-w-md w-full p-8 rounded-2xl border border-slate-800 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-500/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary-500/10 rounded-full blur-2xl"></div>
            
            <div className="w-16 h-16 bg-red-500/15 border border-red-500/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-glow text-red-400 mb-2">Something went wrong</h2>
            <p className="text-slate-400 text-sm mb-6">
              An unexpected client-side error occurred. We have logged this error and will investigate it.
            </p>
            
            {this.state.error && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 text-left font-mono text-xs text-red-300 max-h-32 overflow-y-auto mb-6">
                {this.state.error.toString()}
              </div>
            )}
            
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-6 rounded-xl font-medium bg-primary-600 hover:bg-primary-500 active:scale-[0.98] transition shadow-lg shadow-primary-500/25 text-white"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
