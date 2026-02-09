import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import Logo from '@/components/common/Logo';
import toast from 'react-hot-toast';

const LoginView = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (email: string) => {
    setIsSubmitting(true);
    try {
      const result = await login(email);
      if (result.exists) {
        toast.success('¡Bienvenido de vuelta!');
        navigate('/');
      } else {
        // User doesn't exist — redirect to register with email
        navigate('/auth/register', { state: { email: result.email } });
      }
    } catch {
      toast.error('Error al iniciar sesión');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-8">
      <Logo size="lg" />

      <p className="text-pixel-light/60 text-xs font-pixel text-center">
        Ingresa tu email para comenzar
      </p>

      <LoginForm onLogin={handleLogin} isLoading={isSubmitting} />
    </div>
  );
};

export default LoginView;
