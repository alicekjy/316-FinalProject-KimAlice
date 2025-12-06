import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContextProvider } from './auth';

function App() {
  return (
    <BrowserRouter>
      <AuthContextProvider>
        <div style={{ padding: '50px', textAlign: 'center', color: 'white' }}>
          <h1>🎵 Playlister</h1>
          <p>React app is working!</p>
          <p>Auth context loaded successfully!</p>
        </div>
      </AuthContextProvider>
    </BrowserRouter>
  );
}

export default App;