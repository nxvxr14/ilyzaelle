import { useState, FormEvent, useRef } from 'react';
import type { Module as ModuleType, Category } from '@/types';
import PixelButton from '@/components/common/PixelButton';
import PixelInput from '@/components/common/PixelInput';
import PixelModal from '@/components/common/PixelModal';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/utils/animations';
import { IoAdd, IoTrash, IoPencil, IoDocumentText } from 'react-icons/io5';
import { uploadImage } from '@/api/uploadApi';

interface ModuleManagerProps {
  modules: ModuleType[];
  categories: Category[];
  onCreateModule: (data: Partial<ModuleType>) => Promise<void>;
  onUpdateModule: (id: string, data: Partial<ModuleType>) => Promise<void>;
  onDeleteModule: (id: string) => Promise<void>;
  onEditCards: (moduleId: string) => void;
}

const ModuleManager = ({
  modules,
  categories,
  onCreateModule,
  onUpdateModule,
  onDeleteModule,
  onEditCards,
}: ModuleManagerProps) => {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ModuleType | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [image, setImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const apiBase = import.meta.env.VITE_API_URL.replace('/api', '');

  const filteredModules = filter
    ? modules.filter((m) => m.categoryId === filter)
    : modules;

  const openCreate = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setCategoryId(categories[0]?._id || '');
    setImage('');
    setShowModal(true);
  };

  const openEdit = (mod: ModuleType) => {
    setEditing(mod);
    setName(mod.name);
    setDescription(mod.description);
    setCategoryId(mod.categoryId);
    setImage(mod.image);
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadImage(file);
      if (result.data?.path) setImage(result.data.path);
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editing) {
        await onUpdateModule(editing._id, { name, description, categoryId, image });
      } else {
        await onCreateModule({ name, description, categoryId, image });
      }
      setShowModal(false);
    } catch (err) {
      console.error('Save error:', err);
    }
    setIsSubmitting(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="font-pixel text-sm text-white">MODULOS</h2>
        <div className="flex gap-2 items-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-pixel-dark border border-gray-600 text-white text-sm px-2 py-1"
          >
            <option value="">Todas</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <PixelButton onClick={openCreate} size="sm">
            <IoAdd className="inline mr-1" /> NUEVO
          </PixelButton>
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-2"
      >
        {filteredModules.map((mod) => (
          <motion.div
            key={mod._id}
            variants={fadeInUp}
            className="bg-pixel-dark border border-gray-700 p-3 flex items-center gap-3"
          >
            {mod.image && (
              <img
                src={`${apiBase}${mod.image}`}
                alt={mod.name}
                className="w-10 h-10 object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-pixel text-[10px] text-white truncate">{mod.name}</p>
              <p className="text-gray-500 text-[10px]">
                {categories.find((c) => c._id === mod.categoryId)?.name}
              </p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => onEditCards(mod._id)}
                className="text-pixel-gold hover:text-yellow-300 p-1"
                title="Editar cards"
              >
                <IoDocumentText />
              </button>
              <button onClick={() => openEdit(mod)} className="text-pixel-blue hover:text-white p-1">
                <IoPencil />
              </button>
              <button onClick={() => onDeleteModule(mod._id)} className="text-red-400 hover:text-red-300 p-1">
                <IoTrash />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <PixelModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'EDITAR MODULO' : 'NUEVO MODULO'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block font-pixel text-[10px] text-gray-300 mb-2">Categoria</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-pixel-dark border-2 border-gray-600 text-white px-3 py-2"
              required
            >
              <option value="">Seleccionar...</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <PixelInput label="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
          <PixelInput label="Descripcion" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div>
            <label className="block font-pixel text-[10px] text-gray-300 mb-2">Imagen</label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-gray-400" />
            {image && <img src={`${apiBase}${image}`} alt="Preview" className="mt-2 w-16 h-16 object-cover" />}
          </div>
          <PixelButton type="submit" isLoading={isSubmitting}>
            {editing ? 'GUARDAR' : 'CREAR'}
          </PixelButton>
        </form>
      </PixelModal>
    </div>
  );
};

export default ModuleManager;
