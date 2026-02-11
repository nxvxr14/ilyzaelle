import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import * as endpoints from '@/api/endpoints';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CourseResults from '@/components/course/CourseResults';
import WigglingChest from '@/components/gamification/WigglingChest';
import { getImageUrl } from '@/utils/helpers';
import { toast } from 'react-toastify';
import {
  ArrowLeftIcon,
  LockClosedIcon,
  CheckCircleIcon,
  PlayIcon,
} from '@heroicons/react/24/solid';

const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [showCourseResults, setShowCourseResults] = useState(false);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => endpoints.getCourseById(id!).then((r) => r.data),
    enabled: !!id,
  });

  const { data: progress } = useQuery({
    queryKey: ['progress', id],
    queryFn: () => endpoints.getCourseProgress(id!).then((r) => r.data).catch(() => null),
    enabled: !!id,
    retry: false,
  });

  const enrollMutation = useMutation({
    mutationFn: () => endpoints.enrollInCourse(id!),
    onSuccess: () => {
      toast.success('Inscrito exitosamente');
      queryClient.invalidateQueries({ queryKey: ['course', id] });
      queryClient.invalidateQueries({ queryKey: ['progress', id] });
      queryClient.invalidateQueries({ queryKey: ['user-activity'] });
      if (user) {
        updateUser({ ...user, enrolledCourses: [...(user.enrolledCourses || []), id!] });
      }
    },
    onError: () => toast.error('Error al inscribirse'),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!course) return <p className="p-6 text-lab-text-muted">Curso no encontrado</p>;

  const isEnrolled = progress !== null && progress !== undefined;

  return (
    <div className="py-4">
      {/* Back */}
      <Link to="/courses" className="flex items-center gap-2 text-lab-text-muted hover:text-lab-text mb-4 text-sm">
        <ArrowLeftIcon className="w-4 h-4" />
        Cursos
      </Link>

      {/* Header */}
      <div className="card overflow-hidden p-0 mb-6">
        {course.coverImage && (
          <div className="aspect-video overflow-hidden">
            <img
              src={getImageUrl(course.coverImage)}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-4">
          <h2 className="text-xl font-bold">{course.title}</h2>
          <p className="text-lab-text-muted text-sm mt-2">{course.description}</p>

          {!isEnrolled ? (
            <button
              onClick={() => enrollMutation.mutate()}
              disabled={enrollMutation.isPending}
              className="btn-primary w-full mt-4"
            >
              {enrollMutation.isPending ? 'Inscribiendo...' : 'Inscribirse'}
            </button>
          ) : (
            <div className="flex items-center gap-2 mt-4 text-lab-secondary text-sm">
              <CheckCircleIcon className="w-5 h-5" />
              <span>Inscrito</span>
            </div>
          )}
        </div>
      </div>

      {/* Course completion reward box */}
      {progress?.completed && !progress.completionBadgeEarned && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-lab-gold">
            Recompensa del curso
          </h3>
          <WigglingChest
            onClick={() => setShowCourseResults(true)}
          />
        </div>
      )}

      {/* Modules */}
      <h3 className="font-semibold mb-3">
        Modulos ({course.modules?.length || 0})
      </h3>

      <div className="space-y-3">
        {course.modules?.map((mod, index) => {
          const moduleProgress = progress?.modulesProgress.find(
            (mp) => mp.module === mod._id || (mp.module as any)?._id === mod._id
          );
          const isCompleted = moduleProgress?.completed;
          const isUnlocked = isEnrolled;

          // Calculate module progress %
          const totalModuleCards = mod.cards?.length || 0;
          const completedCards = moduleProgress
            ? moduleProgress.cardsProgress.filter((cp) => cp.completed).length
            : 0;
          const modulePercent = totalModuleCards > 0
            ? Math.round((completedCards / totalModuleCards) * 100)
            : 0;
          const isInProgress = modulePercent > 0 && !isCompleted;

          return (
            <div key={mod._id} className="relative">
              {isUnlocked ? (
                <Link
                  to={`/courses/${course._id}/modules/${mod._id}`}
                  className="card-hover flex items-center gap-3"
                >
                  {/* Module cover */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-lab-bg flex-shrink-0">
                    {mod.coverImage ? (
                      <img
                        src={getImageUrl(mod.coverImage)}
                        alt={mod.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lab-border font-bold">
                        {index + 1}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{mod.title}</p>
                    <p className="text-xs text-lab-text-muted mt-0.5">
                      {`${mod.cards?.length || 0} tarjetas`} &middot; {mod.points} pts
                      {isInProgress && (
                        <span className="text-lab-primary ml-1">&middot; {modulePercent}%</span>
                      )}
                      {isCompleted && (
                        <span className="text-lab-secondary ml-1">&middot; 100%</span>
                      )}
                    </p>
                  </div>

                  {isCompleted ? (
                    <CheckCircleIcon className="w-6 h-6 text-lab-secondary flex-shrink-0" />
                  ) : isInProgress ? (
                    <div className="w-6 h-6 flex-shrink-0 relative">
                      <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" className="text-lab-border" strokeWidth="2" />
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" className="text-lab-primary" strokeWidth="2"
                          strokeDasharray={`${(modulePercent / 100) * 62.83} 62.83`}
                        />
                      </svg>
                    </div>
                  ) : (
                    <PlayIcon className="w-6 h-6 text-lab-primary flex-shrink-0" />
                  )}
                </Link>
              ) : (
                <div className="card flex items-center gap-3 opacity-50">
                  <div className="w-14 h-14 rounded-xl bg-lab-bg flex items-center justify-center flex-shrink-0">
                    <LockClosedIcon className="w-5 h-5 text-lab-text-muted" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{mod.title}</p>
                    <p className="text-xs text-lab-text-muted">Inscribete para acceder</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Course results fullscreen flow */}
      {showCourseResults && progress && (
        <CourseResults
          courseId={id!}
          progress={progress}
          onFinished={() => {
            setShowCourseResults(false);
            queryClient.invalidateQueries({ queryKey: ['progress', id] });
          }}
        />
      )}
    </div>
  );
};

export default CourseDetailPage;
