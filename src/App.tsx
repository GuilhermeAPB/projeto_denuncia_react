import React, { useEffect } from 'react';
import { FormContainer } from './components/form/FormContainer';
import { AuthService } from './services/auth.service';
import './App.css';

function App() {
  useEffect(() => {
    // Autenticar anonimamente quando a app carrega
    const authenticateUser = async () => {
      try {
        if (!AuthService.isAuthenticated()) {
          await AuthService.signInAnon();
          console.log('✅ Usuário autenticado anonimamente');
        }
      } catch (error) {
        console.error('❌ Erro ao autenticar:', error);
      }
    };

    authenticateUser();
  }, []);

  return (
    <div className="App">
      <FormContainer />
    </div>
  );
}

export default App;