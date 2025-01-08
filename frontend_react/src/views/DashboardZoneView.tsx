import React, { useState } from "react";
import Chart from "@/components/dashboard/Chart";

function DashboardZoneView({ gVar }: { gVar: any }) {
    const [charts, setCharts] = useState<number[]>([]);

    const addChart = () => {
        setCharts([...charts, charts.length]);
    };

    if (!gVar) {
        return <div>Loading...</div>;
    }

    const data = {
        labels: gVar.tiempo, // Use tiempo as the labels for the x-axis
        datasets: [
            {
                label: 'Randomize over Time', // Description of the dataset
                data: gVar.randomize, // Use randomize as the data for the y-axis
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            }
        ],
    };

    return (
        <>
            {/* <div className="grid grid-cols-[10%_90%]"> */}
            <button className="bg-black text-white hover:bg-[#FFFF44] hover:text-black font-bold px-10 py-3 text-xl cursor-pointer transition-colors rounded-2xl"
                onClick={addChart}>grafica</button>
            <button className="bg-black text-white hover:bg-[#FFFF44] hover:text-black font-bold px-10 py-3 text-xl cursor-pointer transition-colors rounded-2xl"
                onClick={addChart}>visor</button>
            <div className="grid w-full bg-[#120d18] rounded-2xl overflow-hidden">
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {charts.map((chart, index) => (
                        <div key={index} style={{ width: '50%', padding: '10px' }}>
                            <Chart data={data} />
                        </div>
                    ))}
                </div>
            </div >
        </>
    );
}

export default DashboardZoneView;

{/* 
function DashboardZoneView({ gVar }: { gVar: any }) {
<div>
{gVar && Object.keys(gVar).map((key, index) => (
    <div key={index}>
        <strong>{key}:</strong> {gVar[key]}
    </div>
))}
</div> */}