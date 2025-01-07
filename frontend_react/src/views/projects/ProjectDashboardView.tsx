import { getProjectById } from "@/api/ProjectApi";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";

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
    const [socket, setSocket] = useState<Socket | null>(null); 
       const [online, setOnline] = useState(false);

    // Create socket connection when data is available
    useEffect(() => {
        if (data) {
            const newSocket = io(`http://${data.server}`, {
                transports: ['websocket'],
            });
            setSocket(newSocket);
        }
    }, [data]);

    useEffect(() => {
        if(socket) socket.on('connect', () => {
            setOnline(true);
        })
    }, [socket]);

    useEffect(() => {
        if(socket) socket.on('disconnect', () => {
            setOnline(false);
        })
    }, [socket]);

    useEffect(() => {
        if(socket) socket.on('current-status', (data) => {
            console.log(data)
        })
    }, [socket]);

    // Render the dashboard when data is available
    if (data) return (
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
};

export default ProjectDashboardView;
