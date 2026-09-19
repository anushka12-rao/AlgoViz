import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (process.env.NODE_ENV !== 'production') {
      console.error('ErrorBoundary caught an unhandled rendering error:', error, errorInfo);
    }
  }

  private handleReset = (): void => {
    this.setState({ hasError: false });
    window.location.href = '/';
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-fallback" role="alert">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--error-color)' }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            An unexpected error occurred while rendering the visualization interface.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={this.handleReset}
          >
            Return to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
