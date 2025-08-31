import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './print.css';
import App from './App';
import PrintView from './components/PrintView';
import reportWebVitals from './reportWebVitals';

// Expose print view renderer for the print window
window.renderPrintView = (data, allTasks) => {
  ReactDOM.createRoot(document.getElementById('print-root')).render(
    <React.StrictMode>
      <PrintView data={data} allTasks={allTasks} />
    </React.StrictMode>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
