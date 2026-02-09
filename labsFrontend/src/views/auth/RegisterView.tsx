import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import RegisterForm from '@/components/auth/RegisterForm';
import Logo from '@/components/common/Logo';
import toast from 'react-hot-toast';

const RegisterView = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const email = (location.state as { email?: string })?.email || '';

  const handleRegister = async (data: {
    name: string;
    username: string;
    slogan: string;
    profilePhoto?: File;
  }) => {
    if (!email) {
      toast.error('Email no encontrado. Vuelve a iniciar.');
      navigate('/auth/login');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(
        { email, name: data.name, username: data.username, slogan: data.slogan },
        data.profilePhoto
      );
      toast.success('¡Cuenta creada! Bienvenido 🎮');
      navigate('/');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al registrarse';
      toast.error(msg);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-6">
      <Logo size="md" />

      <p className="text-pixel-light/60 text-xs font-pixel text-center">
        Completa tu perfil
      </p>

      <RegisterForm
        email={email}
        onRegister={(data) => handleRegister(data)}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default RegisterView;
