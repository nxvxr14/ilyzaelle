import { useState } from "react";
import Chart from "@/components/dashboard/Chart";
import Input from "@/components/dashboard/Input";
import Label from "@/components/dashboard/Label";

function DashboardZoneView({ gVar }: { gVar: any }) {
    const [charts, setCharts] = useState<{ id: number; selectedVar: string }[]>([]);
    const [inputs, setInputs] = useState<{ id: number; selectedVar: string }[]>([]);
    const [labels, setLabels] = useState<{ id: number; selectedVar: string }[]>([]);
    const [selectedVar, setSelectedVar] = useState<string>('')

    const addChart = (selectedVar: string) => {
        if (!selectedVar) return <div>Loading...</div>;
        setCharts([...charts, { id: charts.length, selectedVar }]); // Añadir un nuevo gráfico con su selectedVar        
        // console.log(selectedVar);
        // console.log(gVar[selectedVar]);
        setSelectedVar("")
    };

    const addLabel = (selectedVar: string) => {
        if (!selectedVar) return <div>Loading...</div>;
        setLabels([...labels, { id: labels.length, selectedVar }]); // Añadir un nuevo gráfico con su selectedVar        
        // console.log(selectedVar);
        // console.log(gVar[selectedVar]);
        setSelectedVar("")
    };

    const addInput = (selectVar: string) => {
        if (!selectVar) return <div>Loading...</div>;
        setInputs([...inputs, { id: inputs.length, selectedVar }])
    }

    if (!gVar) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <div className="flex space-x-4 items-center">
                <select
                    className="w-full p-3 border-gray-300 border rounded-2xl"
                    value={selectedVar}
                    onChange={(e) => setSelectedVar(e.target.value)} // Solo actualiza selectedVar, no afecta a las gráficas existentes
                >
                    <option value="" disabled>selecciona una variable</option>
                    {Object.keys(gVar).map((key) => (
                        <option key={key} value={key}>{key}</option>
                    ))}
                </select>
                <button
                    className="bg-black text-white hover:bg-[#FFFF44] hover:text-black font-bold px-10 py-3 text-xl cursor-pointer transition-colors rounded-2xl"
                    onClick={() => addChart(selectedVar)} // Solo agrega un nuevo gráfico cuando el botón es presionado
                >
                    grafica
                </button>

                <button
                    className="bg-black text-white hover:bg-[#FFFF44] hover:text-black font-bold px-10 py-3 text-xl cursor-pointer transition-colors rounded-2xl"
                    onClick={() => addInput(selectedVar)} // Solo agrega un nuevo gráfico cuando el botón es presionado
                >
                    input
                </button>

                <button
                    className="bg-black text-white hover:bg-[#FFFF44] hover:text-black font-bold px-10 py-3 text-xl cursor-pointer transition-colors rounded-2xl"
                    onClick={() => addLabel(selectedVar)} // Solo agrega un nuevo gráfico cuando el botón es presionado
                >
                    label
                </button>
            </div>
            <div className="grid w-full bg-[#120d18] rounded-2xl overflow-hidden mt-10">
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {charts.map((chart, index) => (
                        <div key={chart.id} style={{ width: '50%', padding: '10px' }}>
                            <Chart selectedVar={chart.selectedVar} gVar={gVar} />
                        </div>
                    ))}:w
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>

                        {inputs.map((input, index) => (
                            <div key={input.id} style={{ width: '50%', padding: '10px' }}>
                                <Input selectedVar={input.selectedVar} gVar={gVar} />
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {labels.map((label, index) => (
                            <div key={label.id} style={{ width: '50%', padding: '10px' }}>
                                <Label selectedVar={label.selectedVar} gVar={gVar} />
                            </div>
                        ))}
                    </div>
                </div>


            </div>
        </>
    );
}

export default DashboardZoneView;


/*
Explicación de los cambios:

    Estructura de charts: En lugar de almacenar solo los índices de los gráficos, ahora estamos almacenando un objeto que incluye tanto el id del gráfico (un valor único para identificar cada gráfico) como la selectedVar que se utilizó cuando se creó ese gráfico.

    Añadir gráfico: Cuando presionas el botón "grafica", ahora se agrega un nuevo objeto a charts que contiene la selectedVar seleccionada en ese momento.

    Renderizado de gráficos: Al renderizar las gráficas con el map, cada gráfico tiene su propia referencia a la variable (selectedVar) que se usó para crearlo, lo que evita que cambien cuando el selectedVar cambie globalmente.

Resultado esperado:

    Cada gráfico será inmutable: Aunque cambies el valor de selectedVar con el select, las gráficas ya creadas no cambiarán, ya que se han "congelado" con la variable que usaron al momento de ser creadas.
    Gráficas independientes: Cada gráfica será independiente de los cambios que realices en selectedVar después de su creación.


*/


