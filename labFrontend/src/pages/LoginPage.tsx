import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { loginSchema, type LoginFormData } from '@/utils/schemas';

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithEmail } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', name: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await loginWithEmail(data.email.trim(), data.name?.trim() || undefined);
      toast.success('Bienvenido a Laboratorio');
      navigate('/');
    } catch (error) {
      toast.error('Error al iniciar sesion. Intenta de nuevo.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-lab-bg">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            <span className="text-lab-primary">Lab</span>
            <span className="text-lab-text">oratorio</span>
          </h1>
          <p className="text-lab-text-muted text-sm">
            Plataforma de aprendizaje interactivo
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-lab-text-muted mb-1">
              Correo electronico
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              placeholder="tu@correo.com"
              className="input-field"
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-lab-text-muted mb-1">
              Nombre (opcional, solo primera vez)
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              placeholder="Tu nombre"
              className="input-field"
              autoComplete="name"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-xs text-lab-text-muted mt-6">
          Si es tu primera vez, se creara tu cuenta automaticamente.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
