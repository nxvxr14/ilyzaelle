import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { getBoardById } from "@/api/BoardApi";
import CodeEditorForm from '@/components/boards/CodeEditorForm';
import StatusLocalModal from "@/components/projects/StatusLocalModal";

const boardNames: { [key: number]: string } = {
    1: 'Arduino Uno',
    2: 'PLC328P',
};

function CodeEditorBoardView() {

    // el projectId viene como ruta dinamica "/:projectId", para obtenerla se usa params, por el otro lado boardId viene como parametro de consulta, "?boardId" en este caso se usa location
    const params = useParams()
    const projectId = params.projectId!
    const boardId = params.boardId!

    const { data, isError } = useQuery({
        queryKey: ['CodeEditorBoard', boardId],
        // cuando la funcion toma parametros ponemos un callback
        // no puede tomar multiples parametros, si son varios se envian como objeto por medio de llaves
        queryFn: () => getBoardById({ projectId, boardId }),
        // en base a una condicion se ejecuta o no la consulta, solo recibe true/false
        // el !! retorna true, convierte una variable a boolean, si tiene dato retorna true, si no tiene nada false
        // para controlar cuando hacemos una consulta, cuando tenemos el dato en la url
        enabled: !!boardId
    })

    if (isError) return <Navigate to={'/404'} />

    if (data) return (
        <>
            <div className="py-10">
                <StatusLocalModal />
                {/* <StatusLocalModal boards={data.boards}
    server={data.server} /> */}
                <h1 className='text-5xl font-black mt-5'>
                    editor/{data.boardName}
                </h1>
                <p className="text-lg text-gray-400 mt-2">
                    {boardNames[data.boardType] || 'Desconocido'}
                </p>
                <nav className='my-5 flex gap-3'>
                    <Link
                        className="bg-black text-white hover:bg-[#FFFF44] hover:text-black font-bold px-10 py-3 text-xl cursor-pointer transition-colors rounded-2xl"
                        to={`/projects/${projectId}`}
                    >
                        Volver
                    </Link>
                </nav>
            </div>
            <div className="py-10">
                {/* <div className="mt-10">
                <h1 className='text-5xl font-black'>
                editor/globalVar
                </h1>
                <nav className='my-5 flex gap-3'>
                <button
                className='bg-black text-white hover:bg-[#FFFF44] hover:text-black font-bold px-10 py-3 text-xl cursor-pointer transition-colors rounded-2xl'
                // onClick={() => navigate(location.pathname + '?newBoard=true')}
                >
                nueva variable
                </button>
                </nav>
            </div> */}
                <CodeEditorForm boardCode={data.boardCode} />
            </div>
        </>
    )
}

export default CodeEditorBoardView;