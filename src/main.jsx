import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Initialiser le thème avant le rendu
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  const root = document.documentElement;

  if (savedTheme === 'dark') {
    root.classList.add('dark');
  } else if (savedTheme === 'auto') {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark');
    }
  }
};

initializeTheme();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);