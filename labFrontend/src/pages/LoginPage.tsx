import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import * as endpoints from '@/api/endpoints';
import { toast } from 'react-toastify';
import { loginSchema, type LoginFormData } from '@/utils/schemas';

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const { data: result } = await endpoints.checkEmail(data.email.trim());

      if (result.exists && result.token && result.user) {
        loginUser(result.token, result.user);
        toast.success('Bienvenido a Laboratorio');

        if (result.isAdmin) {
          navigate('/admin', { replace: true });
        } else {
          navigate('/home', { replace: true });
        }
      } else {
        // New user — redirect to registration
        navigate(`/register?email=${encodeURIComponent(data.email.trim())}`);
      }
    } catch (error) {
      toast.error('Error al verificar correo. Intenta de nuevo.');
      console.error('Check email error:', error);
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
            Ingresa tu correo para continuar
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

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? 'Verificando...' : 'Continuar'}
          </button>
        </form>

        <p className="text-center text-xs text-lab-text-muted mt-6">
          Si es tu primera vez, te pediremos crear tu perfil.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
