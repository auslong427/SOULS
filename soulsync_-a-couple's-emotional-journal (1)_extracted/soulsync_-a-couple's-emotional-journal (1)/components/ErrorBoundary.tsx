import React, { Component, ReactNode } from 'react';
import { LogoIcon } from './icons/LogoIcon';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-rose-50 to-indigo-100 p-4">
          <div className="w-full max-w-md text-center">
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/30">
              <LogoIcon className="w-24 h-auto text-rose-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-indigo-900 mb-2">Oops! Something went wrong</h2>
              <p className="text-stone-600 mb-6">
                We encountered an unexpected error. Please try reloading the page.
              </p>
              {this.state.error && (
                <details className="text-left text-xs text-stone-500 bg-stone-100 rounded p-3 mb-4">
                  <summary className="cursor-pointer font-semibold">Error details</summary>
                  <pre className="mt-2 whitespace-pre-wrap">{this.state.error.toString()}</pre>
                </details>
              )}
              <button
                onClick={this.handleReload}
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
