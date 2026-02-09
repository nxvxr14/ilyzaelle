import { useAuth } from '@/context/AuthContext';
import UserProfile from '@/components/profile/UserProfile';
import PixelButton from '@/components/common/PixelButton';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/utils/animations';

const ProfileView = () => {
  const { user, logout, updatePhoto } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await updatePhoto(file);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-md mx-auto">
      <motion.div {...fadeInUp} className="flex flex-col items-center gap-6">
        <UserProfile user={user} />

        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <span className="pixel-btn text-xs py-2 px-4 bg-pixel-primary/20 text-pixel-primary border-2 border-pixel-primary rounded">
            Cambiar foto
          </span>
        </label>

        <PixelButton variant="secondary" size="sm" onClick={handleLogout}>
          Cerrar Sesión
        </PixelButton>
      </motion.div>
    </div>
  );
};

export default ProfileView;
