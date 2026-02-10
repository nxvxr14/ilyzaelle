import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import * as endpoints from '@/api/endpoints';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getImageUrl } from '@/utils/helpers';
import { AcademicCapIcon, UsersIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const CoursesPage = () => {
  const { user } = useAuth();

  const { data: courses, isLoading } = useQuery({
    queryKey: ['published-courses'],
    queryFn: () => endpoints.getPublishedCourses().then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner />;

  const enrolledIds = new Set(user?.enrolledCourses || []);

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-1">Cursos</h2>
      <p className="text-lab-text-muted text-sm mb-6">Explora y aprende a tu ritmo</p>

      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {courses.map((course) => {
            const isEnrolled = enrolledIds.has(course._id);

            return (
              <Link
                key={course._id}
                to={`/courses/${course._id}`}
                className="card-hover overflow-hidden p-0 group"
              >
                {/* Cover image 9:16 */}
                <div className="aspect-[9/16] bg-lab-bg relative overflow-hidden">
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

                  {isEnrolled && (
                    <div className="absolute top-2 right-2 bg-lab-primary/90 rounded-full p-1">
                      <CheckCircleIcon className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="font-semibold text-sm truncate">{course.title}</h3>
                  <p className="text-xs text-lab-text-muted mt-1 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-lab-text-muted">
                    <UsersIcon className="w-3 h-3" />
                    <span>{course.enrolledCount}</span>
                  </div>
                </div>
              </Link>
            );
          })}
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
