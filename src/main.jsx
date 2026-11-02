import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

class Boundary extends React.Component {
  state = { err: null };
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div className="splash">
        <h2>Algo falló al mostrar esta pantalla</h2>
        <p className="muted">{String(this.state.err.message || this.state.err)}</p>
        <button className="btn primary" onClick={() => this.setState({ err: null })}>Reintentar</button>
      </div>
    );
  }
}

createRoot(document.getElementById('root')).render(<Boundary><App /></Boundary>);
