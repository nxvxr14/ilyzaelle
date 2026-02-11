import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { getBoardById } from "@/api/BoardApi";
import CodeEditorForm from '@/components/boards/CodeEditorForm';
import Console from '@/components/boards/Console';
import StatusLocalModal from "@/components/projects/StatusLocalModal";

const boardNames: { [key: number]: string } = {
    1: 'Arduino',
    2: 'Xelorium',
    3: 'Esp32',
    4: 'HTTP',
    5: 'MQTT',
    6: "Factory IO"
};

function CodeEditorBoardView() {
    const params = useParams();
    const projectId = params.projectId!;
    const boardId = params.boardId!;

    const { data, isError } = useQuery({
        queryKey: ['CodeEditorBoard', boardId],
        queryFn: () => getBoardById({ projectId, boardId }),
        enabled: !!boardId
    });

    if (isError) return <Navigate to={'/404'} />;

    if (data) return (
        <div className="container mx-auto px-4 py-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                <div className="p-6">
                    {/* Status indicator and local modal */}
                    <div className="mb-4">
                        <StatusLocalModal />
                    </div>

                    {/* Board information header */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-2">
                            <h1 className='text-4xl md:text-5xl font-black text-gray-800'>
                                {data.boardName}
                            </h1>
                            
                            <div className="flex items-center text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                </svg>
                                <span className="text-lg">{boardNames[data.boardType] || 'Desconocido'}</span>
                            </div>
                            
                            {/* Back button - Now below board type */}
                            <div className="pt-2">
                                <Link
                                    className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-3 rounded-xl transition-colors shadow-sm"
                                    to={`/projects/${projectId}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Volver
                                </Link>
                            </div>
                        </div>
                        
                        {/* Status indicator dot - Now on the right side */}
                        <div className="flex items-center space-x-2">
                            <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                                data.active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                                <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full mr-2 ${
                                        data.active ? 'bg-green-500' : 'bg-red-500'
                                    }`}></div>
                                    {data.active ? 'Conectado' : 'Desconectado'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Code Editor */}
            <CodeEditorForm boardCode={data.boardCode} />

            {/* Server Log Console */}
            <div className="mt-6">
                <Console />
            </div>
        </div>
    );

    return null;
}

export default CodeEditorBoardView;