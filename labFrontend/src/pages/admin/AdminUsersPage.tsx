import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import * as endpoints from '@/api/endpoints';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getImageUrl, formatDate } from '@/utils/helpers';
import { toast } from 'react-toastify';
import { TrashIcon } from '@heroicons/react/24/outline';

const AdminUsersPage = () => {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => endpoints.getAllUsers().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => endpoints.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Usuario eliminado');
    },
    onError: () => toast.error('Error al eliminar'),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="py-6 space-y-4">
      <h2 className="text-xl font-bold">Usuarios ({users?.length || 0})</h2>

      <div className="space-y-2">
        {users?.map((user) => (
          <div key={user._id} className="card flex items-center gap-3">
            {/* Avatar */}
            <Link
              to={`/admin/users/${user._id}`}
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-lab-bg flex-shrink-0">
                {user.profileImage ? (
                  <img
                    src={getImageUrl(user.profileImage)}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-bold text-lab-primary">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user.name}</p>
                <p className="text-xs text-lab-text-muted">{user.email}</p>
                <p className="text-xs text-lab-text-muted">
                  {user.totalPoints} pts &middot; {formatDate(user.createdAt)}
                </p>
              </div>
            </Link>

            <button
              onClick={() => {
                if (confirm(`Eliminar a ${user.name}?`)) {
                  deleteMutation.mutate(user._id);
                }
              }}
              className="p-2 text-lab-text-muted hover:text-red-400"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsersPage;
