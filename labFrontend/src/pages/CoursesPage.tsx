import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import * as endpoints from '@/api/endpoints';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getImageUrl } from '@/utils/helpers';
import type { Course, Progress } from '@/types';
import {
  AcademicCapIcon,
  UsersIcon,
  CheckCircleIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';

/** Renders a single course card with optional progress bar */
const CourseCard = ({
  course,
  progress,
}: {
  course: Course;
  progress?: Progress;
}) => {
  const isCompleted = progress?.completed ?? false;
  const percent = useMemo(() => {
    if (!progress) return 0;
    const totalModules = progress.modulesProgress.length;
    if (totalModules === 0) return 0;
    const completedModules = progress.modulesProgress.filter((mp) => mp.completed).length;
    return Math.round((completedModules / totalModules) * 100);
  }, [progress]);

  return (
    <Link
      to={`/courses/${course._id}`}
      className="card-hover overflow-hidden p-0 group"
    >
      {/* Cover image 16:9 */}
      <div className="aspect-video bg-lab-bg relative overflow-hidden">
        {course.coverImage ? (
          <img
            src={getImageUrl(course.coverImage)}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <AcademicCapIcon className="w-12 h-12 text-lab-border" />
          </div>
        )}

        {/* Status badge */}
        {isCompleted && (
          <div className="absolute top-2 right-2 bg-lab-secondary/90 rounded-full px-2 py-0.5 flex items-center gap-1">
            <CheckCircleIcon className="w-3 h-3 text-white" />
            <span className="text-[10px] font-semibold text-white">Completado</span>
          </div>
        )}
        {!isCompleted && progress && percent > 0 && (
          <div className="absolute top-2 right-2 bg-lab-primary/90 rounded-full px-2 py-0.5 flex items-center gap-1">
            <PlayIcon className="w-3 h-3 text-white" />
            <span className="text-[10px] font-semibold text-white">{percent}%</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-sm truncate">{course.title}</h3>
        <p className="text-xs text-lab-text-muted mt-1 line-clamp-2">
          {course.description}
        </p>

        {/* Progress bar for enrolled courses */}
        {progress && (
          <div className="mt-2">
            <div className="h-1.5 bg-lab-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCompleted
                    ? 'bg-lab-secondary'
                    : 'bg-lab-primary'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}

        {/* Enrolled count (only for non-enrolled courses) */}
        {!progress && (
          <div className="flex items-center gap-2 mt-2 text-xs text-lab-text-muted">
            <UsersIcon className="w-3 h-3" />
            <span>{course.enrolledCount}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

const CoursesPage = () => {
  const { user } = useAuth();

  const { data: courses, isLoading: loadingCourses } = useQuery({
    queryKey: ['published-courses'],
    queryFn: () => endpoints.getPublishedCourses().then((r) => r.data),
  });

  const { data: activity, isLoading: loadingActivity } = useQuery({
    queryKey: ['user-activity'],
    queryFn: () => endpoints.getUserActivity().then((r) => r.data),
    enabled: !!user,
  });

  if (loadingCourses || loadingActivity) return <LoadingSpinner />;

  // Build a map of courseId → progress
  const progressMap = new Map<string, Progress>();
  if (activity) {
    for (const p of activity) {
      const courseId = typeof p.course === 'string' ? p.course : p.course._id;
      progressMap.set(courseId, p);
    }
  }

  // Categorize courses
  const inProgress: { course: Course; progress: Progress }[] = [];
  const completed: { course: Course; progress: Progress }[] = [];
  const available: Course[] = [];

  if (courses) {
    for (const course of courses) {
      const progress = progressMap.get(course._id);
      if (progress?.completed) {
        completed.push({ course, progress });
      } else if (progress) {
        inProgress.push({ course, progress });
      } else {
        available.push(course);
      }
    }
  }

  const hasAnyCourses = courses && courses.length > 0;

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-1">Cursos</h2>
      <p className="text-lab-text-muted text-sm mb-6">Explora y aprende a tu ritmo</p>

      {hasAnyCourses ? (
        <div className="space-y-8">
          {/* In progress section */}
          {inProgress.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-lab-primary mb-3 uppercase tracking-wider">
                En progreso ({inProgress.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {inProgress.map(({ course, progress }) => (
                  <CourseCard key={course._id} course={course} progress={progress} />
                ))}
              </div>
            </section>
          )}

          {/* Available section */}
          {available.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-lab-text-muted mb-3 uppercase tracking-wider">
                Disponibles ({available.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {available.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            </section>
          )}

          {/* Completed section */}
          {completed.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-lab-secondary mb-3 uppercase tracking-wider">
                Completados ({completed.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {completed.map(({ course, progress }) => (
                  <CourseCard key={course._id} course={course} progress={progress} />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="card text-center py-12">
          <AcademicCapIcon className="w-16 h-16 text-lab-text-muted mx-auto mb-4" />
          <p className="text-lab-text-muted">No hay cursos disponibles aun</p>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
