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
    const { socket, setServer } = useContext(SocketContext);
    const [gVarData, setGVarData] = useState<any>(null); // State for gVar[project]

    useEffect(() => {
        if (socket) {
            const interval = setInterval(() => {
                socket.emit('projectid-dashboard', projectId);
            }, 1000);

            return () => {
                console.log('desmontando timer')
                clearInterval(interval);
            };
        }
    }, [socket]);

    useEffect(() => {
        if (socket) {
            // Suscribirse al evento 'update-gVar'
            const handleUpdateGVar = (gVarData: object) => {
                console.log("seteando")
                setGVarData(gVarData);
            };

            socket.on('update-gVar', handleUpdateGVar);
            // Limpiar el listener cuando el componente se desmonte o el socket cambie
            return () => {
                console.log('desmontando')
                socket.off('update-gVar', handleUpdateGVar);
            };
        }
    }, [socket]);


    const { data, isLoading, isError } = useQuery({
        queryKey: ['project-dashboard-view', projectId],
        queryFn: () => getProjectById(projectId)
    });

    useEffect(() => {
        if (data) {
            setServer(data.server);
        }
    }, [data, setServer]); // Ejecutamos el efecto solo cuando data cambie
    // la mayoria de problmas de typscript se generan por tipo de dato
    // como socket no obtiene un valor hasta que la data se obtenga toca definir el useState como un objeto socket o null, de esta manera ts no tira error pero js permitiria el funcionamiento, es diferente el maneo a statuslocalmodal

    if (data) {
        // Render the dashboard when data is available
        return (
            <>
                <div className="py-10">
                    <StatusLocalModal />
                    {/* <StatusLocalModal boards={data.boards}
    server={data.server} /> */}
                    <p className="text-sm text-gray-400 italic mt-5">
                        {data.server}
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
    }
    if (isLoading) return 'cargando'
    if (isError) return <Navigate to='/404' />
};

export default ProjectDashboardView;


/*
            handleUpdateGVar: Creé una función handleUpdateGVar que maneja el evento de socket.on('update-gVar'). Esto es necesario para poder pasarla también en el socket.off, para que se elimine correctamente el listener.

socket.on('update-gVar', handleUpdateGVar): Esta es la suscripción a un evento de socket.

return () => { socket.off('update-gVar', handleUpdateGVar); }: En la función de limpieza (la que se devuelve en el useEffect), removemos el listener socket.off('update-gVar', handleUpdateGVar). Este paso es crucial para evitar la acumulación de listeners en cada renderizado o cuando el socket o projectId cambian, lo que podría causar múltiples invocaciones del console.log().
            */