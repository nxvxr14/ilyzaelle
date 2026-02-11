import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import DashboardView from "./views/dashboard/DashboardView";
import CreateProjectView from "./views/projects/CreateProjectView";
import EditProjectView from "./views/projects/EditProjectView";
import ProjectDetailsView from "./views/projects/ProjectDetailsView";
import CodeEditorBoardView from "./views/boards/CodeEditorBoardView";
import ProjectDashboardView from "./views/projects/ProjectDashboardView";
import FdnView from "./views/fdn/fdn";
import AIDashboardView from "./views/dashboard/AIDashboardView";
import PublicDashboardView from "./views/dashboard/PublicDashboardView";

// Importar el contexto del socket
import { SocketProvider } from "./context/SocketContext";

// Wrapper component for SocketProvider
const SocketProviderWrapper = () => {
    return (
        <SocketProvider>
            <Outlet />
        </SocketProvider>
    );
};

const router = () => {

    return (
        <BrowserRouter>
            <Routes>
            {/* Rutas standalone — sin AppLayout */}
            <Route path="/public/dashboard/:dashCode" element={<PublicDashboardView />} />
            <Route path="/fdn" element={<FdnView/>} />

            {/* Cuki (AI Dashboard) — fullscreen, sin header, con SocketProvider */}
            <Route element={<SocketProviderWrapper />}>
                <Route path="/projects/:projectId/ai-dashboard" element={<AIDashboardView />} />
            </Route>

                <Route element={<AppLayout />}>
                    <Route path="/" element={<DashboardView />} index />
                    <Route path="/projects/create" element={<CreateProjectView />} />
                    <Route path="/projects/:projectId/edit" element={<EditProjectView />} />

                    {/* Rutas que necesitan SocketProvider + AppLayout */}
                    <Route element={<SocketProviderWrapper />}>
                        <Route path="/projects/:projectId" element={<ProjectDetailsView />} />
                        <Route path="/projects/:projectId/dashboard" element={<ProjectDashboardView />} />
                        <Route path="/projects/:projectId/boards/:boardId/editor" element={<CodeEditorBoardView />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default router