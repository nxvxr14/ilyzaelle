import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as endpoints from '@/api/endpoints';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import { toast } from 'react-toastify';
import { createCourseSchema, type CreateCourseFormData } from '@/utils/schemas';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

const AdminCoursesPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCourseFormData>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: { title: '', description: '' },
  });

  const { data: courses, isLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: () => endpoints.getAllCourses().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCourseFormData) => endpoints.createCourse(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast.success('Curso creado');
      setShowCreate(false);
      reset();
      navigate(`/admin/courses/${response.data._id}`);
    },
    onError: () => toast.error('Error al crear curso'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => endpoints.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast.success('Curso eliminado');
    },
    onError: () => toast.error('Error al eliminar'),
  });

  const togglePublish = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      endpoints.updateCourse(id, { isPublished }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast.success('Estado actualizado');
    },
  });

  const handleCloseCreate = () => {
    setShowCreate(false);
    reset();
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Cursos</h2>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm py-2">
          <PlusIcon className="w-4 h-4" /> Nuevo
        </button>
      </div>

      <div className="space-y-3">
        {courses?.map((course) => (
          <div key={course._id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <Link
                  to={`/admin/courses/${course._id}`}
                  className="font-medium text-sm hover:text-lab-primary truncate block"
                >
                  {course.title}
                </Link>
                <p className="text-xs text-lab-text-muted mt-0.5">
                  {(course.modules as any[])?.length || 0} modulos &middot; {course.enrolledCount} inscritos
                </p>
              </div>

              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => togglePublish.mutate({ id: course._id, isPublished: !course.isPublished })}
                  className={`p-2 rounded-lg transition-colors ${
                    course.isPublished
                      ? 'text-lab-secondary hover:bg-lab-secondary/20'
                      : 'text-lab-text-muted hover:bg-lab-border'
                  }`}
                  title={course.isPublished ? 'Despublicar' : 'Publicar'}
                >
                  {course.isPublished ? (
                    <EyeIcon className="w-4 h-4" />
                  ) : (
                    <EyeSlashIcon className="w-4 h-4" />
                  )}
                </button>

                <Link
                  to={`/admin/courses/${course._id}`}
                  className="p-2 text-lab-text-muted hover:text-lab-primary hover:bg-lab-primary/10 rounded-lg"
                >
                  <PencilIcon className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => {
                    if (confirm('Eliminar este curso y todo su contenido?')) {
                      deleteMutation.mutate(course._id);
                    }
                  }}
                  className="p-2 text-lab-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {(!courses || courses.length === 0) && (
          <div className="card text-center py-8">
            <p className="text-lab-text-muted">No hay cursos. Crea el primero.</p>
          </div>
        )}
      </div>

      {/* Create modal */}
      <Modal isOpen={showCreate} onClose={handleCloseCreate} title="Nuevo Curso">
        <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
          <div>
            <label className="block text-sm text-lab-text-muted mb-1">Titulo</label>
            <input
              {...register('title')}
              className="input-field"
              placeholder="Nombre del curso"
            />
            {errors.title && (
              <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-lab-text-muted mb-1">Descripcion</label>
            <textarea
              {...register('description')}
              className="input-field min-h-[100px] resize-none"
              placeholder="Descripcion del curso"
            />
            {errors.description && (
              <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="btn-primary w-full"
          >
            {createMutation.isPending ? 'Creando...' : 'Crear Curso'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCoursesPage;
