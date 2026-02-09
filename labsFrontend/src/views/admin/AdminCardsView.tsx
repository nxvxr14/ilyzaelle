import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  createCard,
  updateCard,
  deleteCard,
  reorderCards,
} from '@/api/adminApi';
import CardEditor from '@/components/admin/CardEditor';
import Loading from '@/components/common/Loading';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/utils/animations';

const AdminCardsView = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (moduleId) setIsLoading(false);
  }, [moduleId]);

  if (isLoading || !moduleId) return <Loading />;

  return (
    <div>
      <motion.h1 {...fadeInUp} className="font-pixel text-pixel-primary text-lg mb-6">
        Cards del Módulo
      </motion.h1>

      <CardEditor
        moduleId={moduleId}
        moduleName="Módulo"
        onCreateCard={async (data) => {
          try {
            await createCard({ ...data, moduleId });
            toast.success('Card creada');
          } catch {
            toast.error('Error al crear card');
          }
        }}
        onUpdateCard={async (id, data) => {
          try {
            await updateCard(id, data);
            toast.success('Card actualizada');
          } catch {
            toast.error('Error al actualizar');
          }
        }}
        onDeleteCard={async (id) => {
          if (!confirm('¿Eliminar esta card?')) return;
          try {
            await deleteCard(id);
            toast.success('Card eliminada');
          } catch {
            toast.error('Error al eliminar');
          }
        }}
        onReorderCards={async (cards) => {
          try {
            const orderedIds = cards.map((c) => c.id);
            await reorderCards(moduleId, orderedIds);
          } catch {
            toast.error('Error al reordenar');
          }
        }}
        onBack={() => navigate('/admin/modules')}
      />
    </div>
  );
};

export default AdminCardsView;
