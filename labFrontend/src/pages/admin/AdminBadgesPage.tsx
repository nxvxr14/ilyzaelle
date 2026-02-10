import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as endpoints from '@/api/endpoints';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import { getImageUrl, getRarityColor, getRarityBg } from '@/utils/helpers';
import { toast } from 'react-toastify';
import { createBadgeSchema, type CreateBadgeFormData } from '@/utils/schemas';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const AdminBadgesPage = () => {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateBadgeFormData>({
    resolver: zodResolver(createBadgeSchema),
    defaultValues: { name: '', description: '', rarity: 'common' },
  });

  const { data: badges, isLoading } = useQuery({
    queryKey: ['admin-badges'],
    queryFn: () => endpoints.getAllBadges().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => endpoints.createBadge(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-badges'] });
      toast.success('Insignia creada');
      handleCloseCreate();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al crear insignia');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => endpoints.deleteBadge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-badges'] });
      toast.success('Insignia eliminada');
    },
  });

  const handleCloseCreate = () => {
    setShowCreate(false);
    setImageFile(null);
    reset();
  };

  const onSubmit = (data: CreateBadgeFormData) => {
    if (!imageFile) {
      toast.error('Selecciona una imagen de 40x40px');
      return;
    }
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('rarity', data.rarity);
    formData.append('image', imageFile);
    createMutation.mutate(formData);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Insignias ({badges?.length || 0})</h2>
        <button onClick={() => setShowCreate(true)} className="btn-primary text-sm py-2 flex items-center gap-1">
          <PlusIcon className="w-4 h-4" /> Nueva
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {badges?.map((badge) => (
          <div key={badge._id} className={`card flex flex-col items-center p-4 border ${getRarityBg(badge.rarity)}`}>
            <img
              src={getImageUrl(badge.image)}
              alt={badge.name}
              className="w-10 h-10 mb-2"
            />
            <p className={`font-semibold text-sm ${getRarityColor(badge.rarity)}`}>{badge.name}</p>
            <p className="text-xs text-lab-text-muted text-center mt-1">{badge.description}</p>
            <p className="text-[10px] text-lab-text-muted mt-1 capitalize">{badge.rarity}</p>
            <button
              onClick={() => {
                if (confirm('Eliminar esta insignia?')) {
                  deleteMutation.mutate(badge._id);
                }
              }}
              className="mt-2 p-1.5 text-lab-text-muted hover:text-red-400"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Create modal */}
      <Modal isOpen={showCreate} onClose={handleCloseCreate} title="Nueva Insignia">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-lab-text-muted mb-1">Nombre</label>
            <input {...register('name')} className="input-field" placeholder="Nombre" />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-lab-text-muted mb-1">Descripcion</label>
            <input {...register('description')} className="input-field" placeholder="Descripcion" />
            {errors.description && (
              <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-lab-text-muted mb-1">Rareza</label>
            <select {...register('rarity')} className="input-field">
              <option value="common">Comun</option>
              <option value="rare">Rara</option>
              <option value="epic">Epica</option>
              <option value="legendary">Legendaria</option>
            </select>
            {errors.rarity && (
              <p className="text-red-400 text-xs mt-1">{errors.rarity.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-lab-text-muted mb-1">Imagen (40x40px exactos)</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="input-field text-sm"
            />
            <p className="text-xs text-lab-text-muted mt-1">La imagen debe ser exactamente 40x40 pixeles</p>
          </div>
          <button
            type="submit"
            disabled={!imageFile || createMutation.isPending}
            className="btn-primary w-full"
          >
            {createMutation.isPending ? 'Creando...' : 'Crear Insignia'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminBadgesPage;
