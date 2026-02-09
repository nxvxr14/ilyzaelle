import { useState, useEffect } from 'react';
import { getAllCategoriesAdmin, createCategory, updateCategory, deleteCategory } from '@/api/adminApi';
import CategoryManager from '@/components/admin/CategoryManager';
import Loading from '@/components/common/Loading';
import type { Category } from '@/types';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/utils/animations';

const AdminCategoriesView = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await getAllCategoriesAdmin();
      if (res.data) setCategories(res.data);
    } catch (e) {
      console.error('Fetch categories error:', e);
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
        Categorías
      </motion.h1>

      <CategoryManager
        categories={categories}
        onCreateCategory={async (data) => {
          try {
            await createCategory(data);
            toast.success('Categoría creada');
            fetchData();
          } catch {
            toast.error('Error al crear categoría');
          }
        }}
        onUpdateCategory={async (id, data) => {
          try {
            await updateCategory(id, data);
            toast.success('Categoría actualizada');
            fetchData();
          } catch {
            toast.error('Error al actualizar');
          }
        }}
        onDeleteCategory={async (id) => {
          if (!confirm('¿Eliminar esta categoría?')) return;
          try {
            await deleteCategory(id);
            toast.success('Categoría eliminada');
            fetchData();
          } catch {
            toast.error('Error al eliminar');
          }
        }}
      />
    </div>
  );
};

export default AdminCategoriesView;
