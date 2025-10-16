// src/components/ErrorBoundary.js
import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { handleComponentError } from '@/lib/errorHandler';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Met à jour l'état pour afficher l'UI de fallback au prochain rendu
    return { 
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log l'erreur avec le gestionnaire d'erreur
    const appError = handleComponentError(error, errorInfo, this.props.componentName);
    
    this.setState({
      error: appError,
      errorInfo
    });

    // Log pour le debugging
    console.group('🚨 Error Boundary Caught Error');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();

    // En production, envoyer l'erreur à un service de monitoring
    if (process.env.NODE_ENV === 'production') {
      this.reportErrorToService(error, errorInfo);
    }
  }

  reportErrorToService = (error, errorInfo) => {
    // Ici, vous pourriez envoyer l'erreur à un service comme Sentry, LogRocket, etc.
    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        errorId: this.state.errorId
      };

      // Exemple d'envoi à un endpoint de logging
      fetch('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorReport)
      }).catch(reportError => {
        console.error('Failed to report error:', reportError);
      });
    } catch (reportError) {
      console.error('Error reporting failed:', reportError);
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { fallback: CustomFallback, showDetails = false } = this.props;
      const { error, errorInfo, errorId } = this.state;

      // Si un composant de fallback personnalisé est fourni
      if (CustomFallback) {
        return (
          <CustomFallback
            error={error}
            errorInfo={errorInfo}
            onRetry={this.handleRetry}
            onReload={this.handleReload}
            onGoHome={this.handleGoHome}
          />
        );
      }

      // Interface de fallback par défaut
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Icône d'erreur */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-100 rounded-full">
                <AlertTriangle className="w-12 h-12 text-red-600" />
              </div>
            </div>

            {/* Message principal */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Oups ! Une erreur s'est produite
            </h1>
            
            <p className="text-gray-600 mb-6">
              Nous sommes désolés, mais quelque chose s'est mal passé. 
              L'équipe technique a été notifiée de ce problème.
            </p>

            {/* ID d'erreur */}
            {errorId && (
              <div className="bg-gray-50 rounded-lg p-3 mb-6">
                <p className="text-xs text-gray-500 mb-1">ID d'erreur :</p>
                <code className="text-sm font-mono text-gray-700">{errorId}</code>
              </div>
            )}

            {/* Détails de l'erreur (mode développement) */}
            {showDetails && error && process.env.NODE_ENV === 'development' && (
              <details className="text-left bg-gray-50 rounded-lg p-4 mb-6">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  <Bug className="w-4 h-4 inline mr-2" />
                  Détails techniques
                </summary>
                <div className="text-xs text-gray-600 space-y-2">
                  <div>
                    <strong>Message :</strong>
                    <pre className="mt-1 whitespace-pre-wrap">{error.message}</pre>
                  </div>
                  {error.details && (
                    <div>
                      <strong>Détails :</strong>
                      <pre className="mt-1 whitespace-pre-wrap">
                        {JSON.stringify(error.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Réessayer
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={this.handleReload}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Recharger la page
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Home className="w-4 h-4 mr-1" />
                  Accueil
                </button>
              </div>
            </div>

            {/* Contact support */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Si le problème persiste, contactez le support technique avec l'ID d'erreur ci-dessus.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Composant wrapper pour faciliter l'utilisation
export function withErrorBoundary(Component, options = {}) {
  const WrappedComponent = (props) => (
    <ErrorBoundary 
      componentName={Component.displayName || Component.name}
      {...options}
    >
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook pour déclencher manuellement une erreur (utile pour les tests)
export function useErrorHandler() {
  return {
    reportError: (error, context = {}) => {
      const appError = handleComponentError(error, context, 'Manual Report');
      throw appError;
    }
  };
}

export default ErrorBoundary;