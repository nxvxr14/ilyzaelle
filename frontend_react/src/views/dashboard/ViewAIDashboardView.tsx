import { getProjectById, getAIDash } from "@/api/ProjectApi";
import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";

const ViewAIDashboardView = () => {
  const params = useParams();
  const projectId = params.projectId!;

  const { data: project, isLoading: isLoadingProject, isError: isErrorProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProjectById(projectId),
  });

  const { data: aiDashData, isLoading: isLoadingAIDash, isError: isErrorAIDash } = useQuery({
    queryKey: ['aidash', projectId],
    queryFn: () => getAIDash(projectId),
    enabled: !!projectId,
  });

  const aiDashHtml = aiDashData?.AIDash;
  const aiDashCode = aiDashData?.AIDashCode;

  if (isLoadingProject || isLoadingAIDash) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-2xl font-bold text-gray-600">Cargando AI Dashboard...</div>
    </div>
  );

  if (isErrorProject || isErrorAIDash) return <Navigate to='/404' />;

  if (project) return (
    <div className="min-h-screen bg-gray-100">
      {/* Header fijo */}
      <div className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-bold px-6 py-2 text-sm cursor-pointer transition-all rounded-lg shadow-sm hover:shadow-md flex items-center gap-2"
            to={`/projects/${projectId}/dashboard`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </Link>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Dashboard - {project.projectName}
          </h1>
        </div>
        <Link
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2 text-sm cursor-pointer transition-all rounded-lg shadow-sm hover:shadow-md flex items-center gap-2"
          to={`/projects/${projectId}/ai-dashboard`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Regenerar Dashboard
        </Link>
        {aiDashCode && (
          <Link
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 text-sm cursor-pointer transition-all rounded-lg shadow-sm hover:shadow-md flex items-center gap-2"
            to={`/public/dashboard/${aiDashCode}`}
            target="_blank"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Ver Publico
          </Link>
        )}
      </div>

      {/* Contenido del HTML */}
      <div className="p-4">
        {aiDashHtml ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <iframe
              srcDoc={aiDashHtml}
              title="AI Generated Dashboard"
              className="w-full min-h-[calc(100vh-120px)] border-0"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-xl shadow-lg p-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No hay Dashboard Generado</h2>
            <p className="text-gray-500 mb-6 text-center">
              Aun no se ha generado un dashboard con IA para este proyecto.
            </p>
            <Link
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3 text-lg cursor-pointer transition-all rounded-xl shadow-sm hover:shadow-md flex items-center gap-2"
              to={`/projects/${projectId}/ai-dashboard`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generar AI Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return null;
};

export default ViewAIDashboardView;
