import LoginPage from './pages/LoginPage';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  );
}

export default App
