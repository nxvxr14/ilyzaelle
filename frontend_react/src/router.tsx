import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import DashboardView from "./views/DashboardView";
import CreateProjectView from "./views/projects/CreateProjectView";
import EditProjectView from "./views/projects/EditProjectView";
import ProjectDetailsView from "./views/projects/ProjectDetailsView";
import CodeEditorBoardView from "./views/boards/CodeEditorBoardView";
import ProjectDashboardView from "./views/projects/ProjectDashboardView";

const router = () => {

    return (
        // Routes es el grupo de rutas y route cada ruta individual
        // primero se rodea todo con browser, despues cada ruta estara en el componente de Routes
        // Route se define asi porque usaremos un layout que se va a repetir, para agrupar las rutas y compartir diseño pero por dentro cada una se configura individualmente
        // layout son paginas que nos se refrescan, solo se actualizan los componentes
        // views son las paginas que se definen en routes, aca se agregan componentes

        // dashboard view es el componente hijo, si no se usa la funcion especial outlet en applayout, no se va a renderizar el componente hijo. applayout es el padre
        <BrowserRouter>
            <Routes>
                <Route element={<AppLayout />}>
                    <Route path="/" element={<DashboardView />} index />
                    <Route path="/projects/create" element={<CreateProjectView />} />
                    <Route path="/projects/:projectId/edit" element={<EditProjectView />} />
                    <Route path="/projects/:projectId/" element={<ProjectDetailsView />} />
                    <Route path="/projects/:projectId/dashboard" element={<ProjectDashboardView />} />
                    <Route path="/projects/:projectId/boards/:boardId/editor" element={<CodeEditorBoardView />} />
                </Route>

            </Routes>
        </BrowserRouter>
    )
}

export default router