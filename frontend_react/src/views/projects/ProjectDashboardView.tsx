import { getProjectById } from "@/api/ProjectApi";
import StatusLocalModal from "@/components/projects/StatusLocalModal";
import { SocketContext } from "@/context/SocketContext";
import { useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import DashboardZoneView from "../dashboard/DashboardZoneView";

const ProjectDashboardView = () => {
    const params = useParams();
    // Use '!' to assert that the value will always be present in the params
    const projectId = params.projectId!;

    //  para enviar el server que se recibe en cada proyecto hacia el socket

    const { socket, setServerAPI } = useContext(SocketContext);
    const [gVarData, setGVarData] = useState<any>(null);

    const { data, isLoading, isError } = useQuery({
        // se usa projectid en querykey para que sean unicos, no quede cacheado y no haya problemas mas adelante
        queryKey: ['project', projectId],
        //cuando tengo una funcion que toma un parametro debo tener un callback
        queryFn: () => getProjectById(projectId),
    })

    useEffect(() => {
        if (socket) {
            // Unirse al room del proyecto
            const interval = setInterval(() => {
                socket.emit('join-project', projectId);
            }, 1000);

            // Escuchar actualizaciones de gVar
            const handleUpdateGVar = (gVarData: object) => {
                console.log("Actualizando gVar");
                setGVarData(gVarData);
            };

            socket.on('update-gVar', handleUpdateGVar);

            return () => {
                console.log('desmontando timer')
                clearInterval(interval);
                socket.off('update-gVar', handleUpdateGVar);
            };
        }
    }, [socket, projectId]);

    // Para actualizar una variable desde el frontend
    const updateGVar = (selectedVar: string, inputVar: any) => {
        if (socket) {
            socket.emit('update-input-gVar', {
                projectId,
                selectedVar,
                inputVar
            });
        }
    };

    // Usamos useEffect para evitar setServer dentro del render
    useEffect(() => {
        if (data) {
            setServerAPI(data.serverAPIKey);
        }
    }, [data, setServerAPI]);
    // Ejecutamos el efecto solo cuando data cambie
    // la mayoria de problmas de typscript se generan por tipo de dato
    // como socket no obtiene un valor hasta que la data se obtenga toca definir el useState como un objeto socket o null, de esta manera ts no tira error pero js permitiria el funcionamiento, es diferente el maneo a statuslocalmodal

    if (isLoading) return 'cargando'
    if (isError) return <Navigate to='/404' />


    // Render the dashboard when data is available
    if (data) return (
        <>
            <div className="py-10">
                <StatusLocalModal />
                {/* <StatusLocalModal boards={data.boards}
server={data.server} /> */}
                <p className="text-sm text-gray-400 italic mt-5">
                    {data.host}
                </p>
                <h1 className='text-5xl font-black'>
                    dashboard/{data.projectName}
                </h1>
                <p className='text-2xl font-light text-gray-500 mt-2'>
                    {data.description}
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
            <div>
                <DashboardZoneView gVarData={gVarData} />

            </div>


        </>
    );
};

export default ProjectDashboardView;


/*
            handleUpdateGVar: Creé una función handleUpdateGVar que maneja el evento de socket.on('update-gVar'). Esto es necesario para poder pasarla también en el socket.off, para que se elimine correctamente el listener.

socket.on('update-gVar', handleUpdateGVar): Esta es la suscripción a un evento de socket.

return () => { socket.off('update-gVar', handleUpdateGVar); }: En la función de limpieza (la que se devuelve en el useEffect), removemos el listener socket.off('update-gVar', handleUpdateGVar). Este paso es crucial para evitar la acumulación de listeners en cada renderizado o cuando el socket o projectId cambian, lo que podría causar múltiples invocaciones del console.log().
            */


