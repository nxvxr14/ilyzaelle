import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import PixelInput from '@/components/common/PixelInput';
import PixelButton from '@/components/common/PixelButton';
import { fadeInUp } from '@/utils/animations';

interface LoginFormProps {
  onLogin: (email: string) => void;
  isLoading: boolean;
}

const LoginForm = ({ onLogin, isLoading }: LoginFormProps) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onLogin(email.trim().toLowerCase());
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="w-full max-w-sm flex flex-col gap-4"
    >
      <PixelInput
        type="email"
        placeholder="tu@correo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoFocus
        autoComplete="email"
      />
      <PixelButton type="submit" isLoading={isLoading} size="lg" className="w-full">
        ENTRAR
      </PixelButton>
    </motion.form>
  );
};

export default LoginForm;
