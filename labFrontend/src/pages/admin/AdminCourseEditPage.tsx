import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import * as endpoints from '@/api/endpoints';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import ImageCropper from '@/components/ui/ImageCropper';
import SortableItem from '@/components/admin/SortableItem';
import { getImageUrl, getRarityColor } from '@/utils/helpers';
import { toast } from 'react-toastify';
import {
  createModuleSchema,
  editCourseSchema,
  type CreateModuleFormData,
  type EditCourseFormData,
} from '@/utils/schemas';
import {
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import type { Module, Badge } from '@/types';

const AdminCourseEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [showModuleModal, setShowModuleModal] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const [cropTarget, setCropTarget] = useState<'course' | 'module'>('course');
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Module create form
  const moduleForm = useForm<CreateModuleFormData>({
    resolver: zodResolver(createModuleSchema),
    defaultValues: { title: '', description: '', points: 100 },
  });

  // Course edit form
  const courseForm = useForm<EditCourseFormData>({
    resolver: zodResolver(editCourseSchema),
    defaultValues: { title: '', description: '' },
  });

  const { data: course, isLoading } = useQuery({
    queryKey: ['admin-course', id],
    queryFn: () => endpoints.getCourseById(id!).then((r) => r.data),
    enabled: !!id,
  });

  const { data: allBadges } = useQuery({
    queryKey: ['admin-badges'],
    queryFn: () => endpoints.getAllBadges().then((r) => r.data),
  });

  const completionBadgeMutation = useMutation({
    mutationFn: (badgeId: string | null) =>
      endpoints.updateCourse(id!, { completionBadge: badgeId } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-course', id] });
      toast.success('Insignia de completado actualizada');
    },
    onError: () => toast.error('Error al actualizar insignia'),
  });

  const createModuleMutation = useMutation({
    mutationFn: (data: FormData) => endpoints.createModule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-course', id] });
      toast.success('Modulo creado');
      setShowModuleModal(false);
      moduleForm.reset();
    },
    onError: () => toast.error('Error al crear modulo'),
  });

  const deleteModuleMutation = useMutation({
    mutationFn: (moduleId: string) => endpoints.deleteModule(moduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-course', id] });
      toast.success('Modulo eliminado');
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: (data: EditCourseFormData) => endpoints.updateCourse(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-course', id] });
      toast.success('Curso actualizado');
      setEditingCourse(false);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (modules: { id: string; order: number }[]) =>
      endpoints.reorderModules(modules),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-course', id] });
    },
    onError: () => toast.error('Error al reordenar modulos'),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !course?.modules) return;

    const sortedModules = [...course.modules].sort((a: Module, b: Module) => a.order - b.order);
    const oldIndex = sortedModules.findIndex((m: Module) => m._id === active.id);
    const newIndex = sortedModules.findIndex((m: Module) => m._id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...sortedModules];
    const [moved] = reordered.splice(oldIndex, 1) as [Module];
    reordered.splice(newIndex, 0, moved);

    // Optimistically update the cache with new order
    const updatedModules = reordered.map((m: Module, i: number) => ({ ...m, order: i }));
    queryClient.setQueryData(['admin-course', id], { ...course, modules: updatedModules });

    const updates = reordered.map((m: Module, i: number) => ({ id: m._id, order: i }));
    reorderMutation.mutate(updates);
  };

  const handleCreateModule = (data: CreateModuleFormData) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description || '');
    formData.append('courseId', id!);
    formData.append('points', data.points.toString());
    createModuleMutation.mutate(formData);
  };

  const handleImageSelect = (target: 'course' | 'module', modId?: string) => {
    setCropTarget(target);
    if (modId) setEditingModuleId(modId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropDone = async (blob: Blob) => {
    if (cropTarget === 'module' && editingModuleId) {
      const formData = new FormData();
      formData.append('coverImage', blob, 'cover.webp');
      await endpoints.updateModule(editingModuleId, formData);
      queryClient.invalidateQueries({ queryKey: ['admin-course', id] });
      toast.success('Imagen de modulo actualizada');
    } else if (cropTarget === 'course') {
      const formData = new FormData();
      formData.append('coverImage', blob, 'cover.webp');
      await endpoints.uploadCourseCover(id!, formData);
      queryClient.invalidateQueries({ queryKey: ['admin-course', id] });
      toast.success('Portada del curso actualizada');
    }
  };

  const handleStartEditCourse = () => {
    if (!course) return;
    courseForm.reset({ title: course.title, description: course.description });
    setEditingCourse(true);
  };

  const handleCloseModuleModal = () => {
    setShowModuleModal(false);
    moduleForm.reset();
  };

  if (isLoading) return <LoadingSpinner />;
  if (!course) return <p className="p-6">Curso no encontrado</p>;

  return (
    <div className="py-4 space-y-6">
      <Link to="/admin/courses" className="flex items-center gap-2 text-lab-text-muted hover:text-lab-text text-sm">
        <ArrowLeftIcon className="w-4 h-4" /> Cursos
      </Link>

      {/* Course info */}
      <div className="card">
        {/* Cover image */}
        <button
          onClick={() => handleImageSelect('course')}
          className="w-full h-40 rounded-xl overflow-hidden bg-lab-bg mb-4 hover:opacity-80 transition-opacity group relative"
        >
          {course.coverImage ? (
            <img src={getImageUrl(course.coverImage)} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <PhotoIcon className="w-8 h-8 text-lab-text-muted" />
              <span className="text-xs text-lab-text-muted">Agregar portada del curso</span>
            </div>
          )}
          {course.coverImage && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-medium">Cambiar portada</span>
            </div>
          )}
        </button>

        {editingCourse ? (
          <form
            onSubmit={courseForm.handleSubmit((data) => updateCourseMutation.mutate(data))}
            className="space-y-3"
          >
            <div>
              <input
                {...courseForm.register('title')}
                className="input-field"
              />
              {courseForm.formState.errors.title && (
                <p className="text-red-400 text-xs mt-1">{courseForm.formState.errors.title.message}</p>
              )}
            </div>
            <div>
              <textarea
                {...courseForm.register('description')}
                className="input-field min-h-[80px] resize-none"
              />
              {courseForm.formState.errors.description && (
                <p className="text-red-400 text-xs mt-1">{courseForm.formState.errors.description.message}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary text-sm py-2">
                Guardar
              </button>
              <button type="button" onClick={() => setEditingCourse(false)} className="btn-secondary text-sm py-2">
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">{course.title}</h2>
              <p className="text-sm text-lab-text-muted mt-1">{course.description}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-lab-text-muted">
                <span className={course.isPublished ? 'text-lab-secondary' : 'text-lab-accent'}>
                  {course.isPublished ? 'Publicado' : 'Borrador'}
                </span>
                <span>{course.enrolledCount} inscritos</span>
              </div>
            </div>
            <button
              onClick={handleStartEditCourse}
              className="p-2 text-lab-text-muted hover:text-lab-primary"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Completion badge */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <TrophyIcon className="w-5 h-5 text-lab-gold" />
          <h3 className="font-semibold text-sm">Insignia de completado</h3>
        </div>
        <p className="text-xs text-lab-text-muted mb-3">
          Se otorga al completar todos los modulos del curso.
        </p>

        <select
          value={(course.completionBadge as Badge | null)?._id || ''}
          onChange={(e) => completionBadgeMutation.mutate(e.target.value || null)}
          className="input-field text-sm"
        >
          <option value="">Sin insignia</option>
          {allBadges?.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name} ({b.rarity})
            </option>
          ))}
        </select>

        {(course.completionBadge as Badge | null) && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-lab-bg mt-3">
            <img
              src={getImageUrl((course.completionBadge as Badge).image)}
              alt={(course.completionBadge as Badge).name}
              className="w-10 h-10"
            />
            <div>
              <p className={`font-semibold text-sm ${getRarityColor((course.completionBadge as Badge).rarity)}`}>
                {(course.completionBadge as Badge).name}
              </p>
              <p className="text-xs text-lab-text-muted capitalize">
                {(course.completionBadge as Badge).rarity}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modules */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Modulos ({course.modules?.length || 0})</h3>
          <button
            onClick={() => setShowModuleModal(true)}
            className="btn-primary text-sm py-2 flex items-center gap-1"
          >
            <PlusIcon className="w-4 h-4" /> Modulo
          </button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={(course.modules || [])
              .slice()
              .sort((a: Module, b: Module) => a.order - b.order)
              .map((m: Module) => m._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {course.modules
                ?.slice()
                .sort((a: Module, b: Module) => a.order - b.order)
                .map((mod: Module, index: number) => (
                <SortableItem key={mod._id} id={mod._id}>
                  <div
                    className="card cursor-pointer hover:border-lab-primary/30 transition-colors"
                    onClick={() => navigate(`/admin/courses/${id}/modules/${mod._id}`)}
                  >
                    <div className="flex items-center gap-3">
                      {/* Cover */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleImageSelect('module', mod._id); }}
                        className="w-14 h-14 rounded-xl overflow-hidden bg-lab-bg flex-shrink-0 hover:opacity-80 transition-opacity"
                      >
                        {mod.coverImage ? (
                          <img src={getImageUrl(mod.coverImage)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <PhotoIcon className="w-5 h-5 text-lab-text-muted" />
                          </div>
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm hover:text-lab-primary truncate">
                          {index + 1}. {mod.title}
                        </p>
                        <p className="text-xs text-lab-text-muted">
                          {mod.cards?.length || 0} tarjetas &middot; {mod.points} pts
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Eliminar este modulo?')) {
                            deleteModuleMutation.mutate(mod._id);
                          }
                        }}
                        className="p-2 text-lab-text-muted hover:text-red-400"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

      {/* Create module modal */}
      <Modal isOpen={showModuleModal} onClose={handleCloseModuleModal} title="Nuevo Modulo">
        <form onSubmit={moduleForm.handleSubmit(handleCreateModule)} className="space-y-4">
          <div>
            <label className="block text-sm text-lab-text-muted mb-1">Titulo</label>
            <input
              {...moduleForm.register('title')}
              className="input-field"
              placeholder="Nombre del modulo"
            />
            {moduleForm.formState.errors.title && (
              <p className="text-red-400 text-xs mt-1">{moduleForm.formState.errors.title.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-lab-text-muted mb-1">Descripcion</label>
            <textarea
              {...moduleForm.register('description')}
              className="input-field min-h-[80px] resize-none"
              placeholder="Descripcion"
            />
            {moduleForm.formState.errors.description && (
              <p className="text-red-400 text-xs mt-1">{moduleForm.formState.errors.description.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-lab-text-muted mb-1">Puntos</label>
            <input
              type="number"
              {...moduleForm.register('points', { valueAsNumber: true })}
              className="input-field"
              min={0}
            />
            {moduleForm.formState.errors.points && (
              <p className="text-red-400 text-xs mt-1">{moduleForm.formState.errors.points.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={createModuleMutation.isPending}
            className="btn-primary w-full"
          >
            {createModuleMutation.isPending ? 'Creando...' : 'Crear Modulo'}
          </button>
        </form>
      </Modal>

      {/* Image cropper */}
      <ImageCropper
        isOpen={cropperOpen}
        onClose={() => setCropperOpen(false)}
        imageSrc={imageSrc}
        onCropComplete={handleCropDone}
        aspect={cropTarget === 'module' ? 9 / 16 : 16 / 9}
        title={cropTarget === 'module' ? 'Portada del modulo' : 'Portada del curso'}
      />
    </div>
  );
};

export default AdminCourseEditPage;
