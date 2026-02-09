import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllCategoriesAdmin,
  getAllModulesAdmin,
  createModule,
  updateModule,
  deleteModule,
} from '@/api/adminApi';
import ModuleManager from '@/components/admin/ModuleManager';
import Loading from '@/components/common/Loading';
import type { Category, Module } from '@/types';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/utils/animations';

const AdminModulesView = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [catRes, modRes] = await Promise.all([
        getAllCategoriesAdmin(),
        getAllModulesAdmin(),
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (modRes.data) setModules(modRes.data);
    } catch (e) {
      console.error('Fetch modules error:', e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) return <Loading />;

  return (
    <div>
      <motion.h1 {...fadeInUp} className="font-pixel text-pixel-primary text-lg mb-6">
        Módulos
      </motion.h1>

      <ModuleManager
        modules={modules}
        categories={categories}
        onCreateModule={async (data) => {
          try {
            await createModule(data);
            toast.success('Módulo creado');
            fetchData();
          } catch {
            toast.error('Error al crear módulo');
          }
        }}
        onUpdateModule={async (id, data) => {
          try {
            await updateModule(id, data);
            toast.success('Módulo actualizado');
            fetchData();
          } catch {
            toast.error('Error al actualizar');
          }
        }}
        onDeleteModule={async (id) => {
          if (!confirm('¿Eliminar este módulo?')) return;
          try {
            await deleteModule(id);
            toast.success('Módulo eliminado');
            fetchData();
          } catch {
            toast.error('Error al eliminar');
          }
        }}
        onEditCards={(moduleId) => navigate(`/admin/modules/${moduleId}/cards`)}
      />
    </div>
  );
};

export default AdminModulesView;
