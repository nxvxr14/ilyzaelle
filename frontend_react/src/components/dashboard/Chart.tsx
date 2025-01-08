import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
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
};

function Chart({ selectedVar, gVar }: varProps) {

    const data = {
        labels: gVar.time, // Use tiempo as the labels for the x-axis
        datasets: [
            {
                label: 'Randomize over Time', // Description of the dataset
                data: gVar[selectedVar], // Use randomize as the data for the y-axis
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            }
        ],
    };

    const limitedData = {
        ...data,
        labels: data.labels.slice(-50),
        datasets: data.datasets.map((dataset: any) => ({
            ...dataset,
            data: dataset.data.slice(-50),
        })),
    };

    return <Line options={options} data={limitedData} />;
}

export default Chart;


