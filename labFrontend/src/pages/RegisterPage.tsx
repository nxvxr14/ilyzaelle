import { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import * as endpoints from '@/api/endpoints';
import ImageCropper from '@/components/ui/ImageCropper';
import { toast } from 'react-toastify';
import { registerSchema, type RegisterFormData } from '@/utils/schemas';
import { CameraIcon } from '@heroicons/react/24/outline';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [avatarBlob, setAvatarBlob] = useState<Blob | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', username: '', slogan: '' },
  });

  // Redirect if no email
  if (!email) {
    navigate('/login', { replace: true });
    return null;
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error('La imagen no puede superar 50MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (blob: Blob) => {
    setAvatarBlob(blob);
    setAvatarPreview(URL.createObjectURL(blob));
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('name', data.name);
      formData.append('username', data.username);
      formData.append('slogan', data.slogan);

      if (avatarBlob) {
        formData.append('profileImage', avatarBlob, 'profile.webp');
      }

      const { data: result } = await endpoints.registerUser(formData);
      loginUser(result.token, result.user);
      toast.success('Cuenta creada. Bienvenido!');
      navigate('/home', { replace: true });
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Error al crear cuenta';
      toast.error(msg);
      console.error('Register error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-lab-bg">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            <span className="text-lab-primary">Crear</span>
            <span className="text-lab-text"> perfil</span>
          </h1>
          <p className="text-lab-text-muted text-sm">{email}</p>
        </div>

        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-lab-surface border-2 border-lab-border">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lab-text-muted">
                  <CameraIcon className="w-8 h-8" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-1.5 bg-lab-primary rounded-full text-white"
            >
              <CameraIcon className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-lab-text-muted mb-1">
              Nombre
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              placeholder="Tu nombre"
              className="input-field"
              autoComplete="name"
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-lab-text-muted mb-1">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              {...register('username')}
              placeholder="tu_usuario"
              className="input-field"
              autoComplete="username"
            />
            {errors.username && (
              <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="slogan" className="block text-sm font-medium text-lab-text-muted mb-1">
              Slogan <span className="text-lab-text-muted">(opcional)</span>
            </label>
            <input
              id="slogan"
              type="text"
              {...register('slogan')}
              placeholder="Tu frase o lema"
              className="input-field"
            />
            {errors.slogan && (
              <p className="text-red-400 text-xs mt-1">{errors.slogan.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
      </div>

      {/* Image cropper modal */}
      <ImageCropper
        isOpen={cropperOpen}
        onClose={() => setCropperOpen(false)}
        imageSrc={imageSrc}
        onCropComplete={handleCropComplete}
        aspect={1}
        title="Foto de perfil"
      />
    </div>
  );
};

export default RegisterPage;
