import { useNavigate, useParams } from "react-router-dom";
import Chart from "@/components/dashboard/Chart";
import Input from "@/components/dashboard/Input";
import Label from "@/components/dashboard/Label";
import Toggle from "@/components/dashboard/Toggle"; // Import the new Toggle component
import GlobalVarList from "@/components/globalvars/GlobalVarList";
import AddGlobalVarModal from "@/components/globalvars/AddGlobalVarModal";
import { useComponentManager } from "@/hooks/useComponentManager";
import RemovableComponent from "@/components/dashboard/RemovableComponent";
import ClearDashboardButton from "@/components/dashboard/ClearDashboardButton";
import { useEffect } from "react";

function DashboardZoneView({ gVarData }: { gVarData: any }) {
    const navigate = useNavigate();
    const params = useParams();
    // Get projectId from params, or use a default for safety
    const projectId = params.projectId || 'default';
    
    // Pass gVarData to the hook for validation
    const {
        charts,
        inputs,
        labels,
        toggles,
        addChart,
        removeChart,
        updateChartTitle,
        addInput,
        removeInput,
        updateInputTitle,
        addLabel,
        removeLabel,
        updateLabelTitle,
        addToggle,
        removeToggle,
        updateToggleTitle,
        clearAllComponents
    } = useComponentManager(projectId, gVarData);

    if (!gVarData) {
        return <div className="flex items-center justify-center min-h-64 bg-white rounded-xl shadow-md p-8">
            <div className="animate-pulse text-2xl font-bold text-gray-600">Cargando variables...</div>
        </div>;
    }

    return (
        <>
            <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <h2 className="text-3xl font-black text-gray-800 mb-3 md:mb-0 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Variables Globales
                    </h2>
                    <div className="flex gap-3">
                        <button
                            className="bg-black text-white hover:bg-[#FFFF44] hover:text-black font-bold px-8 py-3 text-lg cursor-pointer transition-all rounded-xl shadow-sm hover:shadow-md flex items-center gap-2"
                            onClick={() => navigate(location.pathname + '?newGlobalVar=true')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nueva Variable
                        </button>
                        
                        <ClearDashboardButton onClear={clearAllComponents} className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-bold px-6 py-3 text-lg cursor-pointer transition-all rounded-xl shadow-sm hover:shadow-md flex items-center gap-2" />
                    </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
                    <GlobalVarList
                        gVarData={gVarData}
                        onAddChart={addChart}
                        onAddLabel={addLabel}
                        onAddInput={addInput}
                        onAddToggle={addToggle}
                    />
                </div>
            </div>

            <AddGlobalVarModal />
            
            <div className="bg-[#120d18] rounded-xl shadow-lg overflow-hidden p-6 mb-10">
                <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-yellow-400 pl-4">
                    Panel de Visualización
                </h2>
                
                {/* Charts section */}
                {charts.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-gray-300 mb-4">Gráficos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {charts.map((chart) => (
                                <div key={chart.id} className="bg-[#1a1625] rounded-lg p-4 shadow-inner">
                                    <RemovableComponent 
                                        onRemove={() => removeChart(chart.id)}
                                        title={chart.title}
                                        onTitleChange={(newTitle) => updateChartTitle(chart.id, newTitle)}
                                    >
                                        <Chart selectedVar={chart.selectedVar} gVar={gVarData} />
                                    </RemovableComponent>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Inputs section */}
                {inputs.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-gray-300 mb-4">Entradas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {inputs.map((input) => (
                                <div key={input.id} className="bg-[#1a1625] rounded-lg p-4 shadow-inner">
                                    <RemovableComponent 
                                        onRemove={() => removeInput(input.id)}
                                        title={input.title}
                                        onTitleChange={(newTitle) => updateInputTitle(input.id, newTitle)}
                                    >
                                        <Input selectedVar={input.selectedVar} gVar={gVarData} />
                                    </RemovableComponent>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Labels section */}
                {labels.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-gray-300 mb-4">Etiquetas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {labels.map((label) => (
                                <div key={label.id} className="bg-[#1a1625] rounded-lg p-4 shadow-inner">
                                    <RemovableComponent 
                                        onRemove={() => removeLabel(label.id)}
                                        title={label.title}
                                        onTitleChange={(newTitle) => updateLabelTitle(label.id, newTitle)}
                                    >
                                        <Label selectedVar={label.selectedVar} gVar={gVarData} />
                                    </RemovableComponent>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Toggles section */}
                {toggles.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-gray-300 mb-4">Interruptores</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {toggles.map((toggle) => (
                                <div key={toggle.id} className="bg-[#1a1625] rounded-lg p-4 shadow-inner">
                                    <RemovableComponent 
                                        onRemove={() => removeToggle(toggle.id)}
                                        title={toggle.title}
                                        onTitleChange={(newTitle) => updateToggleTitle(toggle.id, newTitle)}
                                    >
                                        <Toggle selectedVar={toggle.selectedVar} gVar={gVarData} />
                                    </RemovableComponent>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty state message */}
                {charts.length === 0 && inputs.length === 0 && labels.length === 0 && toggles.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                        </svg>
                        <p className="text-xl font-medium text-gray-400">No hay componentes en el panel</p>
                        <p className="text-gray-500 mt-2">Agregue componentes desde la lista de variables globales</p>
                    </div>
                )}
            </div>
        </>
    );
}

export default DashboardZoneView;


