import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Bars3Icon } from '@heroicons/react/24/outline';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

const SortableItem = ({ id, children }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div className="flex items-center">
        <button
          {...attributes}
          {...listeners}
          className="p-2 text-lab-text-muted hover:text-lab-primary cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
          aria-label="Arrastrar para reordenar"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SortableItem;
