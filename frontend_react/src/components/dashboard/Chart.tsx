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

function Chart({data}: any) {
    if (!data) {
        return <div>Error: Invalid chart data</div>;
    }
    // Limit the data to the last 20 points
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