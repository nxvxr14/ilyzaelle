import { useNavigate, useParams } from "react-router-dom";
import Chart from "@/components/dashboard/Chart";
import Input from "@/components/dashboard/Input";
import Label from "@/components/dashboard/Label";
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
    const projectId = params.projectId;
    
    // Log projectId to verify it's being passed correctly
    useEffect(() => {
        console.log('Current projectId in DashboardZoneView:', projectId);
    }, [projectId]);
    
    const {
        charts,
        inputs,
        labels,
        addChart,
        removeChart,
        updateChartTitle,
        addInput,
        removeInput,
        updateInputTitle,
        addLabel,
        removeLabel,
        updateLabelTitle,
        clearAllComponents
    } = useComponentManager(projectId);

    // Log state whenever it changes
    useEffect(() => {
        console.log('Current charts:', charts);
        console.log('Current inputs:', inputs);
        console.log('Current labels:', labels);
    }, [charts, inputs, labels]);

    if (!gVarData) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <div className="py-10">
                <p className='text-5xl font-black'>
                    user/globalVars
                </p>
                <div className='my-5 flex justify-between items-center'>
                    <button
                        className='bg-black text-white hover:bg-[#FFFF44] hover:text-black font-bold px-10 py-3 text-xl cursor-pointer transition-colors rounded-2xl'
                        onClick={() => navigate(location.pathname + '?newGlobalVar=true')}
                    >
                        nueva variable
                    </button>
                    
                    <ClearDashboardButton onClear={clearAllComponents} />
                </div>
            </div>

            <GlobalVarList
                gVarData={gVarData}
                onAddChart={addChart}
                onAddLabel={addLabel}
                onAddInput={addInput}
            />

            <AddGlobalVarModal />
            
            <div className="grid w-full bg-[#120d18] rounded-2xl overflow-hidden mt-10 p-4">
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {charts.map((chart) => (
                        <div key={chart.id} style={{ width: '50%', padding: '10px' }}>
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
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {inputs.map((input) => (
                        <div key={input.id} style={{ width: '50%', padding: '10px' }}>
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
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {labels.map((label) => (
                        <div key={label.id} style={{ width: '50%', padding: '10px' }}>
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
        </>
    );
}

export default DashboardZoneView;


