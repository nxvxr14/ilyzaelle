import { getAIDashByCode } from "@/api/ProjectApi";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

const PublicDashboardView = () => {
  const params = useParams();
  const dashCode = params.dashCode!;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['publicDashboard', dashCode],
    queryFn: () => getAIDashByCode(dashCode),
    enabled: !!dashCode,
  });

  // Vista de carga - pantalla completa
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-xl font-light">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Vista de error - pantalla completa
  if (isError || !data) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h1 className="text-2xl font-bold text-white mb-2">Dashboard no encontrado</h1>
          <p className="text-gray-400">
            {error instanceof Error ? error.message : 'El codigo del dashboard es invalido o ha expirado.'}
          </p>
        </div>
      </div>
    );
  }

  // Dashboard sin contenido
  if (!data.AIDash) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h1 className="text-2xl font-bold text-white mb-2">Dashboard vacio</h1>
          <p className="text-gray-400">Este dashboard aun no tiene contenido generado.</p>
        </div>
      </div>
    );
  }

  // Vista del dashboard - iframe pantalla completa sin bordes ni margenes
  return (
    <iframe
      srcDoc={data.AIDash}
      title={data.projectName ? `Dashboard - ${data.projectName}` : 'AI Dashboard'}
      className="fixed inset-0 w-full h-full border-0"
      sandbox="allow-scripts allow-same-origin"
    />
  );
};

export default PublicDashboardView;
