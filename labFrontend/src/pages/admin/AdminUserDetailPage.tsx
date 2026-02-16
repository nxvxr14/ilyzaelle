import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import * as endpoints from '@/api/endpoints';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getImageUrl, formatDate, formatDuration, getRarityColor } from '@/utils/helpers';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

const AdminUserDetailPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-user-detail', userId],
    queryFn: () => endpoints.getUserDetail(userId!).then((r) => r.data),
    enabled: !!userId,
  });

  if (isLoading) return <LoadingSpinner />;
  if (!data) return <p className="p-6 text-lab-text-muted">Usuario no encontrado</p>;

  const { user, totalTimeMs, courses } = data;

  // Collect all badges from courses
  const badges: { name: string; image: string; rarity: string }[] = [];
  for (const c of courses) {
    if (c.completionBadge) badges.push(c.completionBadge);
    for (const mp of c.modulesProgress) {
      if (mp.badgeEarned) badges.push(mp.badgeEarned);
    }
  }

  return (
    <div className="py-6 space-y-6">
      {/* Back link */}
      <Link to="/admin/users" className="flex items-center gap-2 text-sm text-lab-text-muted hover:text-lab-text">
        <ArrowLeftIcon className="w-4 h-4" /> Volver a usuarios
      </Link>

      {/* User header */}
      <div className="card flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-lab-bg flex-shrink-0">
          {user.profileImage ? (
            <img src={getImageUrl(user.profileImage)} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-lab-primary">
              {user.name?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold truncate">{user.name}</h2>
          {user.username && <p className="text-sm text-lab-text-muted">@{user.username}</p>}
          <p className="text-xs text-lab-text-muted">{user.email}</p>
          {user.slogan && <p className="text-xs text-lab-text-muted italic mt-1">{user.slogan}</p>}
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Puntos totales" value={user.totalPoints} color="text-lab-gold" />
        <StatCard label="Tiempo total" value={formatDuration(totalTimeMs)} color="text-lab-secondary" />
        <StatCard label="Cursos inscritos" value={courses.length} color="text-lab-primary" />
        <StatCard label="Insignias" value={badges.length} color="text-lab-accent" />
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-3">Insignias obtenidas</h3>
          <div className="flex flex-wrap gap-3">
            {badges.map((b, i) => (
              <div key={i} className="flex items-center gap-2 bg-lab-bg rounded-xl px-3 py-2">
                <img src={getImageUrl(b.image)} alt={b.name} className="w-8 h-8" />
                <div>
                  <p className="text-xs font-medium">{b.name}</p>
                  <p className={`text-[10px] ${getRarityColor(b.rarity)}`}>{b.rarity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-course breakdown */}
      <div className="space-y-4">
        <h3 className="font-semibold">Progreso por curso</h3>
        {courses.length === 0 && (
          <p className="text-sm text-lab-text-muted">Sin cursos inscritos</p>
        )}
        {courses.map((c: any) => (
          <div key={c.course._id} className="card space-y-3">
            {/* Course header */}
            <div className="flex items-center gap-3">
              {c.course.coverImage && (
                <img
                  src={getImageUrl(c.course.coverImage)}
                  alt={c.course.title}
                  className="w-12 h-8 rounded object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{c.course.title}</p>
                <p className="text-xs text-lab-text-muted">
                  {c.totalPoints} pts &middot; {formatDuration(c.timeMs)}
                  {c.completed && ' \u00b7 Completado'}
                </p>
              </div>
            </div>

            {/* Modules */}
            <div className="space-y-2">
              {c.modulesProgress.map((mp: any) => {
                const modId = mp.module?._id || mp.module;
                const modTitle = mp.module?.title || 'Modulo';
                const isExpanded = expandedModule === modId;

                // Count quiz results
                let totalQuiz = 0;
                let correctQuiz = 0;
                for (const cp of mp.cardsProgress) {
                  if (cp.quizDetails) {
                    for (const q of Object.values(cp.quizDetails) as any[]) {
                      totalQuiz++;
                      if (q.correct) correctQuiz++;
                    }
                  }
                }

                return (
                  <div key={modId} className="bg-lab-bg rounded-xl overflow-hidden">
                    {/* Module header - clickable */}
                    <button
                      onClick={() => setExpandedModule(isExpanded ? null : modId)}
                      className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-lab-surface/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{modTitle}</p>
                        <p className="text-xs text-lab-text-muted">
                          {mp.pointsEarned} pts &middot; {formatDuration(mp.timeMs)}
                          {totalQuiz > 0 && ` \u00b7 Quiz: ${correctQuiz}/${totalQuiz}`}
                          {mp.completed && ' \u00b7 \u2713'}
                        </p>
                      </div>
                      <span className={`text-xs text-lab-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        &#9660;
                      </span>
                    </button>

                    {/* Expanded: card-level detail */}
                    {isExpanded && (
                      <div className="px-3 pb-3 space-y-2 border-t border-lab-border">
                        {mp.cardsProgress.map((cp: any, cpIdx: number) => (
                          <CardDetail key={cpIdx} cp={cp} />
                        ))}
                        {mp.cardsProgress.length === 0 && (
                          <p className="text-xs text-lab-text-muted py-2">Sin progreso en tarjetas</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-lab-text-muted text-center">
        Registro desde {formatDate(user.createdAt)}
      </p>
    </div>
  );
};

/** Small stat card */
const StatCard = ({ label, value, color }: { label: string; value: string | number; color: string }) => (
  <div className="card text-center">
    <p className={`text-xl font-bold ${color}`}>{value}</p>
    <p className="text-xs text-lab-text-muted">{label}</p>
  </div>
);

/** Card-level progress with quiz details and upload responses */
const CardDetail = ({ cp }: { cp: any }) => {
  const quizEntries = Object.entries(cp.quizDetails || {}) as [string, any][];
  const uploadEntries = Object.entries(cp.uploadDetails || {}) as [string, any][];

  return (
    <div className="pt-2">
      <p className="text-xs font-medium text-lab-text-muted mb-1">
        {cp.cardTitle || 'Tarjeta'}
        {cp.completed && <span className="text-lab-secondary ml-1">(completada)</span>}
      </p>
      {quizEntries.length > 0 && (
        <div className="space-y-2 ml-2">
          {quizEntries.map(([idx, q]) => (
            <div key={idx} className="text-xs space-y-1">
              <p className="font-medium">{q.question}</p>
              <div className="space-y-0.5 ml-2">
                {q.options.map((opt: string, optIdx: number) => {
                  const isSelected = optIdx === q.selected;
                  const isCorrect = optIdx === q.correctIndex;
                  let cls = 'text-lab-text-muted';
                  if (isCorrect) cls = 'text-lab-secondary';
                  if (isSelected && !q.correct) cls = 'text-red-400';
                  if (isSelected && q.correct) cls = 'text-lab-secondary';

                  return (
                    <div key={optIdx} className={`flex items-center gap-1 ${cls}`}>
                      {isSelected && q.correct && <CheckCircleIcon className="w-3 h-3 flex-shrink-0" />}
                      {isSelected && !q.correct && <XCircleIcon className="w-3 h-3 flex-shrink-0" />}
                      {!isSelected && isCorrect && <CheckCircleIcon className="w-3 h-3 flex-shrink-0 opacity-50" />}
                      {!isSelected && !isCorrect && <span className="w-3 h-3 flex-shrink-0" />}
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      {uploadEntries.length > 0 && (
        <div className="space-y-2 ml-2 mt-2">
          {uploadEntries.map(([idx, u]) => (
            <div key={idx} className="text-xs space-y-1">
              <p className="font-medium">{u.prompt}</p>
              <img
                src={getImageUrl(u.imageUrl)}
                alt="Foto subida por estudiante"
                className="max-h-40 rounded-lg object-contain"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUserDetailPage;
