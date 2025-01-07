import { getProjectById } from "@/api/ProjectApi";
import StatusLocalModal from "@/components/projects/StatusLocalModal";
import { SocketContext } from "@/context/SocketContext";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

const ProjectDashboardView = () => {
    const params = useParams();
    // Use '!' to assert that the value will always be present in the params
    const projectId = params.projectId!;

    //  para enviar el server que se recibe en cada proyecto hacia el socket
    const { setServer } = useContext(SocketContext);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => getProjectById(projectId)
    });
    if (data) setServer(data.server);
    // la mayoria de problmas de typscript se generan por tipo de dato
    // como socket no obtiene un valor hasta que la data se obtenga toca definir el useState como un objeto socket o null, de esta manera ts no tira error pero js permitiria el funcionamiento, es diferente el maneo a statuslocalmodal

    if (data) {
        // Render the dashboard when data is available
        return (
            <div className="mt-10">
                <h1 className="text-5xl font-black">
                    dashboard/{data.projectName}
                </h1>
                <StatusLocalModal boards={data.boards}
                    server={data.server} />
                <nav className="mt-5 flex gap-3">
                    <Link
                        className="bg-black text-white hover:bg-[#FFFF44] hover:text-black font-bold px-10 py-3 text-xl cursor-pointer transition-colors rounded-2xl"
                        to={`/projects/${projectId}`}
                    >
                        Volver
                    </Link>
                </nav>
            </div>
        );
    }
    if (isLoading) return 'cargando'
    if (isError) return <Navigate to='/404' />
};

export default ProjectDashboardView;


/*
import { getProjectById } from "@/api/ProjectApi";
import { useSocket } from "@/hooks/useSocket";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Socket } from "socket.io-client";

type Project = {
    projectName: string;
    server: string; // Assuming 'server' is a string
    boardType: string;
};

const ProjectDashboardView = () => {
    const params = useParams();
    // Use '!' to assert that the value will always be present in the params
    const projectId = params.projectId!;

    const { data, isLoading, isError } = useQuery<Project>({
        queryKey: ['project', projectId],
        queryFn: () => getProjectById(projectId)
    });

    // la mayoria de problmas de typscript se generan por tipo de dato
    // como socket no obtiene un valor hasta que la data se obtenga toca definir el useState como un objeto socket o null, de esta manera ts no tira error pero js permitiria el funcionamiento, es diferente el maneo a statuslocalmodal
    const [gVarData, setGVarData] = useState<any>(null); // Estado para almacenar gVar[project]
    const [serverPath, setServerPath] = useState<string>('');
    const { socket, online } = useSocket(serverPath);

    useEffect(() => {
        if (data?.server) {
            setServerPath(data.server);
        }
    }, [data]);

    useEffect(() => {
        if (socket && data) socket.emit('projectid-dashboard', projectId)
    }, [socket]);

    useEffect(() => {
        if (socket && data) socket.on('update-gVar', (gVarData) => {
            setGVarData(gVarData); 
            console.log(gVarData)
        });
    }, [socket]);

    if (data) {
        // Render the dashboard when data is available
        return (
            <div className="mt-10">
                <h1 className="text-5xl font-black">
                    dashboard/{data.projectName}
                </h1>
                <div
                    className={`inline-block px-4 py-2 rounded-lg text-center text-white text-sm ${online ? 'bg-green-500' : 'bg-red-500'
                        }`}
                >
                    {online ? 'En Línea' : 'Desconectado'}
                </div>
                <nav className="mt-5 flex gap-3">
                    <Link
                        className="bg-black text-white hover:bg-[#FFFF44] hover:text-black font-bold px-10 py-3 text-xl cursor-pointer transition-colors rounded-2xl"
                        to={`/projects/${projectId}`}
                    >
                        Volver
                    </Link>
                </nav>
            </div>
        );
    }
    if (isLoading) return 'cargando'
    if (isError) return <Navigate to='/404' />
};

export default ProjectDashboardView;
*/