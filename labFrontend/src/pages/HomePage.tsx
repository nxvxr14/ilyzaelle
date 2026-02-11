import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import * as endpoints from '@/api/endpoints';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatPoints, getImageUrl } from '@/utils/helpers';
import {
  AcademicCapIcon,
  TrophyIcon,
  StarIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const { user } = useAuth();

  const { data: activity, isLoading: loadingActivity } = useQuery({
    queryKey: ['user-activity'],
    queryFn: () => endpoints.getUserActivity().then((r) => r.data),
  });

  const { data: badges, isLoading: loadingBadges } = useQuery({
    queryKey: ['user-badges'],
    queryFn: () => endpoints.getUserBadges().then((r) => r.data),
  });

  if (loadingActivity || loadingBadges) return <LoadingSpinner />;

  const enrolledCount = activity?.length || 0;
  const completedCount = activity?.filter((p) => p.completed).length || 0;
  const badgeCount = badges?.length || 0;

  return (
    <div className="py-6 space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold">
          Hola, <span className="text-lab-primary">{user?.name}</span>
        </h2>
        <p className="text-lab-text-muted text-sm mt-1">
          Continua tu aprendizaje
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card flex items-center gap-3">
          <div className="p-2 rounded-xl bg-lab-primary/20">
            <StarIcon className="w-5 h-5 text-lab-primary" />
          </div>
          <div>
            <p className="text-lg font-bold">{formatPoints(user?.totalPoints || 0)}</p>
            <p className="text-xs text-lab-text-muted">Puntos</p>
          </div>
        </div>

        <div className="card flex items-center gap-3">
          <div className="p-2 rounded-xl bg-lab-secondary/20">
            <TrophyIcon className="w-5 h-5 text-lab-secondary" />
          </div>
          <div>
            <p className="text-lg font-bold">{badgeCount}</p>
            <p className="text-xs text-lab-text-muted">Insignias</p>
          </div>
        </div>

        <div className="card flex items-center gap-3">
          <div className="p-2 rounded-xl bg-lab-accent/20">
            <AcademicCapIcon className="w-5 h-5 text-lab-accent" />
          </div>
          <div>
            <p className="text-lg font-bold">{enrolledCount}</p>
            <p className="text-xs text-lab-text-muted">Inscritos</p>
          </div>
        </div>

        <div className="card flex items-center gap-3">
          <div className="p-2 rounded-xl bg-lab-gold/20">
            <AcademicCapIcon className="w-5 h-5 text-lab-gold" />
          </div>
          <div>
            <p className="text-lg font-bold">{completedCount}</p>
            <p className="text-xs text-lab-text-muted">Completados</p>
          </div>
        </div>
      </div>

      {/* Active courses */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Mis cursos activos</h3>
          <Link to="/courses" className="text-sm text-lab-primary flex items-center gap-1">
            Ver todos <ArrowRightIcon className="w-3 h-3" />
          </Link>
        </div>

        {activity && activity.length > 0 ? (
          <div className="space-y-3">
            {activity
              .filter((p) => !p.completed)
              .slice(0, 3)
              .map((progress) => {
                const course = progress.course as any;
                const completedModules = progress.modulesProgress.filter(
                  (mp) => mp.completed
                ).length;
                const totalModules = progress.modulesProgress.length;
                const percent = totalModules > 0
                  ? Math.round((completedModules / totalModules) * 100)
                  : 0;

                return (
                  <Link
                    key={progress._id}
                    to={`/courses/${course._id || progress.course}`}
                    className="card-hover block"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {course.title || 'Curso'}
                        </p>
                        <p className="text-xs text-lab-text-muted mt-1">
                          {completedModules}/{totalModules} modulos
                        </p>
                      </div>
                      <div className="ml-3 text-right">
                        <p className="text-sm font-bold text-lab-primary">{percent}%</p>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2 h-1.5 bg-lab-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-lab-primary rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </Link>
                );
              })}
          </div>
        ) : (
          <div className="card text-center py-8">
            <AcademicCapIcon className="w-12 h-12 text-lab-text-muted mx-auto mb-3" />
            <p className="text-lab-text-muted">No tienes cursos activos</p>
            <Link to="/courses" className="btn-primary inline-block mt-4">
              Explorar cursos
            </Link>
          </div>
        )}
      </div>

      {/* Recent badges */}
      {badges && badges.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Insignias recientes</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {badges.slice(0, 6).map((ub, i) => (
              <div
                key={i}
                className="card flex-shrink-0 flex flex-col items-center p-3 w-20"
              >
                <img
                  src={getImageUrl(ub.badge.image)}
                  alt={ub.badge.name}
                  className="w-10 h-10"
                />
                <p className="text-[10px] text-lab-text-muted mt-1 text-center truncate w-full">
                  {ub.badge.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
