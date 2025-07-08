import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import MainRoutes from './Routes.jsx';
import { AuthProvider } from './contexts/AuthContext'; // 🟡 ajuste o caminho se necessário

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <MainRoutes />
    </AuthProvider>
  </BrowserRouter>
);
