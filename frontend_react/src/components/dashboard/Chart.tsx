import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    InteractionMode,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

type varProps = {
    selectedVar: string;
    gVar: any; // You can define a more specific type based on the shape of gVar if needed
};

export const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top' as const,
        },
        title: {
            display: true,
            text: 'Chart.js Line Chart',
        },
    },
    animation: {
        duration: 0, // Desactiva las animaciones
    },
    scales: {
        x: {
            grid: {
                color: 'rgba(255, 255, 255, 0.2)', // Color blanco para la cuadrícula del eje X
                lineWidth: 1 // Ancho de las líneas de la cuadrícula del eje X
            }
        },
        y: {
            grid: {
                color: 'rgba(255, 255, 255, 0.2)', // Color blanco para la cuadrícula del eje Y
                lineWidth: 1 // Ancho de las líneas de la cuadrícula del eje Y
            }
        }
    },
    interaction: {
        mode: 'nearest' as InteractionMode, // TypeScript will now expect one of the valid InteractionMode values
        intersect: false // Para que el gráfico responda al movimiento del mouse incluso sin que toque un punto
    }
};

function Chart({ selectedVar, gVar }: varProps) {

    const data = {
        labels: gVar.time, // Use tiempo as the labels for the x-axis
        datasets: [
            {
                label: selectedVar, // Description of the dataset
                data: gVar[selectedVar], // Use randomize as the data for the y-axis
                borderColor: 'rgb(255, 255, 0)', // Color amarillo para el trazo (la línea que une los puntos)               
                backgroundColor: 'rgb(255, 255, 0)',
                tension: 0.2,
                // Cambia los puntos a un tamaño más pequeño
                pointRadius: 2, // Establece el tamaño de los puntos (puedes ajustar este valor según el tamaño que desees)
                pointBackgroundColor: 'rgb(255, 255, 0)', // Cambia el color de los puntos a amarillo
                pointBorderColor: 'rgb(255, 255, 0)', // Establece el borde de los puntos a amarillo
                borderWidth: 1 // Establece el ancho de la línea (puedes hacerla más fina con un valor bajo, como 1 o 2)
            }
        ],
    };

    const limitedData = {
        ...data,
        labels: data.labels.slice(-30),
        datasets: data.datasets.map((dataset: any) => ({
            ...dataset,
            data: dataset.data.slice(-30),
        })),
    };

    return <Line options={options} data={limitedData} />;
}

export default Chart;


