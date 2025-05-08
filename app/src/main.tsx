import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { AppConfigProvider } from './AppConfig';
import { loadAppConfig } from './services/configService';
import { App } from './App';
import '@/index.css';
import { BrowserRouter } from 'react-router-dom';

await loadAppConfig();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
  <AppConfigProvider>
    <Provider store={store}>
      <React.StrictMode>      
        <App />        
      </React.StrictMode>
    </Provider>
  </AppConfigProvider>
  </BrowserRouter>
);
