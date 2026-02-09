import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import type { User } from '@/types';
import { loginUser, registerUser, updateProfilePhoto } from '@/api/authApi';
import type { RegisterInput } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string) => Promise<{ exists: boolean; email?: string }>;
  register: (input: RegisterInput, profilePhoto?: File) => Promise<void>;
  logout: () => void;
  updatePhoto: (file: File) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('labs_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as User;
        setUser(parsed);
      } catch {
        localStorage.removeItem('labs_user');
        localStorage.removeItem('labs_user_id');
      }
    }
    setIsLoading(false);
  }, []);

  const persistUser = useCallback((userData: User) => {
    setUser(userData);
    localStorage.setItem('labs_user', JSON.stringify(userData));
    localStorage.setItem('labs_user_id', userData._id);
  }, []);

  const login = useCallback(async (email: string): Promise<{ exists: boolean; email?: string }> => {
    const res = await loginUser(email);
    if (res.data?.exists && res.data.user) {
      persistUser(res.data.user);
      return { exists: true };
    }
    return { exists: false, email: res.data?.email || email };
  }, [persistUser]);

  const register = useCallback(async (input: RegisterInput, profilePhoto?: File) => {
    const res = await registerUser(input);
    if (res.data?.user) {
      persistUser(res.data.user);

      // Upload profile photo if provided
      if (profilePhoto) {
        try {
          localStorage.setItem('labs_user_id', res.data.user._id);
          const photoRes = await updateProfilePhoto(profilePhoto);
          if (photoRes.data?.profilePhoto) {
            const updatedUser = { ...res.data.user, profilePhoto: photoRes.data.profilePhoto };
            persistUser(updatedUser);
          }
        } catch (e) {
          console.error('Photo upload error after register:', e);
        }
      }
    }
  }, [persistUser]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('labs_user');
    localStorage.removeItem('labs_user_id');
  }, []);

  const updatePhoto = useCallback(async (file: File) => {
    const res = await updateProfilePhoto(file);
    if (res.data?.profilePhoto && user) {
      const updatedUser = { ...user, profilePhoto: res.data.profilePhoto };
      persistUser(updatedUser);
    }
  }, [user, persistUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updatePhoto,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
