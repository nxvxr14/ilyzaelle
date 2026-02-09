import { useState, FormEvent, useRef } from 'react';
import type { Category } from '@/types';
import PixelButton from '@/components/common/PixelButton';
import PixelInput from '@/components/common/PixelInput';
import PixelModal from '@/components/common/PixelModal';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/utils/animations';
import { IoAdd, IoTrash, IoPencil } from 'react-icons/io5';
import { uploadImage } from '@/api/uploadApi';

interface CategoryManagerProps {
  categories: Category[];
  onCreateCategory: (data: Partial<Category>) => Promise<void>;
  onUpdateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

const CategoryManager = ({
  categories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
}: CategoryManagerProps) => {
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const apiBase = import.meta.env.VITE_API_URL.replace('/api', '');

  const openCreate = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImage('');
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description);
    setImage(cat.image);
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadImage(file);
      if (result.data?.path) {
        setImage(result.data.path);
      }
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await onUpdateCategory(editingCategory._id, { name, description, image });
      } else {
        await onCreateCategory({ name, description, image });
      }
      setShowModal(false);
    } catch (err) {
      console.error('Save error:', err);
    }
    setIsSubmitting(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-pixel text-sm text-white">CATEGORIAS</h2>
        <PixelButton onClick={openCreate} size="sm">
          <IoAdd className="inline mr-1" /> NUEVA
        </PixelButton>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        {categories.map((cat) => (
          <motion.div
            key={cat._id}
            variants={fadeInUp}
            className="bg-pixel-dark border border-gray-700 p-4 flex items-center gap-3"
          >
            {cat.image && (
              <img
                src={`${apiBase}${cat.image}`}
                alt={cat.name}
                className="w-12 h-12 object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-pixel text-[10px] text-white truncate">{cat.name}</p>
              <p className="text-gray-400 text-xs truncate">{cat.description}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => openEdit(cat)}
                className="text-pixel-blue hover:text-white p-1"
              >
                <IoPencil />
              </button>
              <button
                onClick={() => onDeleteCategory(cat._id)}
                className="text-red-400 hover:text-red-300 p-1"
              >
                <IoTrash />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <PixelModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCategory ? 'EDITAR CATEGORIA' : 'NUEVA CATEGORIA'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <PixelInput
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <PixelInput
            label="Descripcion"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div>
            <label className="block font-pixel text-[10px] text-gray-300 mb-2">
              Imagen
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="text-sm text-gray-400"
            />
            {image && (
              <img
                src={`${apiBase}${image}`}
                alt="Preview"
                className="mt-2 w-20 h-20 object-cover"
              />
            )}
          </div>
          <PixelButton type="submit" isLoading={isSubmitting}>
            {editingCategory ? 'GUARDAR' : 'CREAR'}
          </PixelButton>
        </form>
      </PixelModal>
    </div>
  );
};

export default CategoryManager;
