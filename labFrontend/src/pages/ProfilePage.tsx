import { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import * as endpoints from '@/api/endpoints';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ImageCropper from '@/components/ui/ImageCropper';
import { getImageUrl, formatPoints, formatDate, getRarityColor, getRarityBg } from '@/utils/helpers';
import { toast } from 'react-toastify';
import { profileNameSchema, type ProfileNameFormData } from '@/utils/schemas';
import {
  CameraIcon,
  StarIcon,
  TrophyIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [editName, setEditName] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileNameFormData>({
    resolver: zodResolver(profileNameSchema),
    defaultValues: { name: user?.name || '' },
  });

  const { data: badges, isLoading: loadingBadges } = useQuery({
    queryKey: ['user-badges'],
    queryFn: () => endpoints.getUserBadges().then((r) => r.data),
  });

  const { data: activity, isLoading: loadingActivity } = useQuery({
    queryKey: ['user-activity'],
    queryFn: () => endpoints.getUserActivity().then((r) => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => endpoints.updateProfile(data),
    onSuccess: (response) => {
      updateUser(response.data);
      toast.success('Perfil actualizado');
      setEditName(false);
    },
    onError: () => toast.error('Error al actualizar perfil'),
  });

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
    const formData = new FormData();
    formData.append('profileImage', blob, 'profile.webp');
    updateMutation.mutate(formData);
  };

  const handleNameSave = (data: ProfileNameFormData) => {
    const formData = new FormData();
    formData.append('name', data.name);
    updateMutation.mutate(formData);
  };

  const handleStartEditName = () => {
    reset({ name: user?.name || '' });
    setEditName(true);
  };

  if (loadingBadges || loadingActivity) return <LoadingSpinner />;

  return (
    <div className="py-6 space-y-6">
      {/* Profile header */}
      <div className="card text-center">
        {/* Avatar */}
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-lab-bg mx-auto border-2 border-lab-primary">
            {user?.profileImage ? (
              <img
                src={getImageUrl(user.profileImage)}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-lab-primary">
                {user?.name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>
          <button
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

        {/* Name */}
        <div className="mt-3">
          {editName ? (
            <form onSubmit={handleSubmit(handleNameSave)} className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <input
                  {...register('name')}
                  className="input-field w-48 text-center text-sm"
                  autoFocus
                />
                <button type="submit" className="btn-primary py-2 px-4 text-sm">
                  Guardar
                </button>
              </div>
              {errors.name && (
                <p className="text-red-400 text-xs">{errors.name.message}</p>
              )}
            </form>
          ) : (
            <button
              onClick={handleStartEditName}
              className="text-lg font-bold hover:text-lab-primary transition-colors"
            >
              {user?.name}
            </button>
          )}
        </div>

        <p className="text-sm text-lab-text-muted">{user?.email}</p>
        <p className="text-xs text-lab-text-muted mt-1">
          Miembro desde {user?.createdAt ? formatDate(user.createdAt) : ''}
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-6 mt-4">
          <div className="text-center">
            <StarIcon className="w-5 h-5 text-lab-gold mx-auto mb-1" />
            <p className="font-bold">{formatPoints(user?.totalPoints || 0)}</p>
            <p className="text-xs text-lab-text-muted">Puntos</p>
          </div>
          <div className="text-center">
            <TrophyIcon className="w-5 h-5 text-lab-secondary mx-auto mb-1" />
            <p className="font-bold">{badges?.length || 0}</p>
            <p className="text-xs text-lab-text-muted">Insignias</p>
          </div>
          <div className="text-center">
            <AcademicCapIcon className="w-5 h-5 text-lab-primary mx-auto mb-1" />
            <p className="font-bold">{activity?.filter((p) => p.completed).length || 0}</p>
            <p className="text-xs text-lab-text-muted">Completados</p>
          </div>
        </div>
      </div>

      {/* Badges collection */}
      <div>
        <h3 className="font-semibold mb-3">Mis Insignias</h3>
        {badges && badges.length > 0 ? (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {badges.map((ub, i) => (
              <div
                key={i}
                className={`card flex flex-col items-center p-3 border ${getRarityBg(ub.badge.rarity)}`}
              >
                <img
                  src={getImageUrl(ub.badge.image)}
                  alt={ub.badge.name}
                  className="w-10 h-10"
                />
                <p className={`text-[9px] mt-1 text-center font-medium ${getRarityColor(ub.badge.rarity)}`}>
                  {ub.badge.name}
                </p>
                {ub.isCompletionBadge && (
                  <span className="text-[8px] text-lab-gold mt-0.5">CURSO</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-6">
            <TrophyIcon className="w-10 h-10 text-lab-text-muted mx-auto mb-2" />
            <p className="text-sm text-lab-text-muted">Completa modulos para obtener insignias</p>
          </div>
        )}
      </div>

      {/* Course progress */}
      <div>
        <h3 className="font-semibold mb-3">Progreso de Cursos</h3>
        {activity && activity.length > 0 ? (
          <div className="space-y-3">
            {activity.map((progress) => {
              const course = progress.course as any;
              const completedModules = progress.modulesProgress.filter((mp) => mp.completed).length;
              const totalModules = progress.modulesProgress.length;
              const percent = totalModules > 0
                ? Math.round((completedModules / totalModules) * 100)
                : 0;

              return (
                <div key={progress._id} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm truncate">{course.title || 'Curso'}</p>
                    <span className={`text-xs font-bold ${progress.completed ? 'text-lab-secondary' : 'text-lab-primary'}`}>
                      {percent}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-lab-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        progress.completed ? 'bg-lab-secondary' : 'bg-lab-primary'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-lab-text-muted">
                    <span>{completedModules}/{totalModules} modulos</span>
                    <span>{progress.totalPoints} pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card text-center py-6">
            <p className="text-sm text-lab-text-muted">No tienes cursos inscritos</p>
          </div>
        )}
      </div>

      {/* Image cropper modal */}
      <ImageCropper
        isOpen={cropperOpen}
        onClose={() => setCropperOpen(false)}
        imageSrc={imageSrc}
        onCropComplete={handleCropComplete}
        aspect={1}
        title="Foto de perfil"
        outputWidth={200}
        outputHeight={200}
      />
    </div>
  );
};

export default ProfilePage;
