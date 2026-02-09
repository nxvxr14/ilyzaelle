import { useState, FormEvent, useRef } from 'react';
import { motion } from 'framer-motion';
import PixelInput from '@/components/common/PixelInput';
import PixelButton from '@/components/common/PixelButton';
import { fadeInUp } from '@/utils/animations';
import { IoCamera } from 'react-icons/io5';

interface RegisterFormProps {
  email: string;
  onRegister: (data: {
    email: string;
    name: string;
    username: string;
    slogan: string;
    profilePhoto?: File;
  }) => void;
  isLoading: boolean;
}

const RegisterForm = ({ email, onRegister, isLoading }: RegisterFormProps) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [slogan, setSlogan] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoCapture = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onRegister({
      email,
      name: name.trim(),
      username: username.trim().toLowerCase(),
      slogan: slogan.trim(),
      profilePhoto: photoFile || undefined,
    });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="w-full max-w-sm flex flex-col gap-4"
    >
      <p className="font-pixel text-[10px] text-pixel-blue text-center mb-2">
        NUEVO USUARIO
      </p>

      {/* Profile photo capture */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handlePhotoCapture}
          className="w-24 h-24 border-2 border-dashed border-gray-500 flex items-center justify-center
                     hover:border-pixel-primary transition-colors overflow-hidden bg-pixel-dark"
        >
          {photoPreview ? (
            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-gray-400">
              <IoCamera size={24} />
              <span className="font-pixel text-[6px]">FOTO</span>
            </div>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <PixelInput
        placeholder="Correo"
        value={email}
        disabled
        className="opacity-60"
      />
      <PixelInput
        placeholder="Nombre completo"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        minLength={2}
      />
      <PixelInput
        placeholder="nombre_usuario"
        value={username}
        onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
        required
        minLength={3}
      />
      <PixelInput
        placeholder="Tu eslogan (opcional)"
        value={slogan}
        onChange={(e) => setSlogan(e.target.value)}
      />

      <PixelButton type="submit" isLoading={isLoading} size="lg" className="w-full">
        REGISTRARSE
      </PixelButton>
    </motion.form>
  );
};

export default RegisterForm;
