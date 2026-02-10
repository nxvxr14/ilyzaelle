import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import * as endpoints from '@/api/endpoints';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  UsersIcon,
  AcademicCapIcon,
  CubeIcon,
  ChartBarIcon,
  TrophyIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => endpoints.getAdminStats().then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner />;

  const statCards = [
    { label: 'Usuarios', value: stats?.totalUsers || 0, icon: UsersIcon, color: 'text-lab-primary' },
    { label: 'Cursos', value: stats?.totalCourses || 0, icon: AcademicCapIcon, color: 'text-lab-secondary' },
    { label: 'Publicados', value: stats?.publishedCourses || 0, icon: CubeIcon, color: 'text-lab-gold' },
    { label: 'Modulos', value: stats?.totalModules || 0, icon: ChartBarIcon, color: 'text-lab-accent' },
    { label: 'Inscripciones', value: stats?.totalEnrollments || 0, icon: UsersIcon, color: 'text-blue-400' },
    { label: 'Completados', value: stats?.completedCourses || 0, icon: TrophyIcon, color: 'text-green-400' },
  ];

  return (
    <div className="py-6 space-y-6">
      <h2 className="text-2xl font-bold">Panel de Administracion</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statCards.map((stat) => (
          <div key={stat.label} className="card">
            <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-lab-text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="font-semibold mb-3">Acciones rapidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link to="/admin/courses" className="card-hover flex items-center gap-3">
            <div className="p-2 bg-lab-primary/20 rounded-xl">
              <AcademicCapIcon className="w-5 h-5 text-lab-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Gestionar Cursos</p>
              <p className="text-xs text-lab-text-muted">Crear, editar y publicar cursos</p>
            </div>
          </Link>

          <Link to="/admin/users" className="card-hover flex items-center gap-3">
            <div className="p-2 bg-lab-secondary/20 rounded-xl">
              <UsersIcon className="w-5 h-5 text-lab-secondary" />
            </div>
            <div>
              <p className="font-medium text-sm">Gestionar Usuarios</p>
              <p className="text-xs text-lab-text-muted">Ver y administrar usuarios</p>
            </div>
          </Link>

          <Link to="/admin/badges" className="card-hover flex items-center gap-3">
            <div className="p-2 bg-lab-gold/20 rounded-xl">
              <TrophyIcon className="w-5 h-5 text-lab-gold" />
            </div>
            <div>
              <p className="font-medium text-sm">Gestionar Insignias</p>
              <p className="text-xs text-lab-text-muted">Crear y asignar insignias</p>
            </div>
          </Link>

          <Link to="/admin/courses/new" className="card-hover flex items-center gap-3">
            <div className="p-2 bg-lab-accent/20 rounded-xl">
              <PlusIcon className="w-5 h-5 text-lab-accent" />
            </div>
            <div>
              <p className="font-medium text-sm">Nuevo Curso</p>
              <p className="text-xs text-lab-text-muted">Crear un curso desde cero</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
