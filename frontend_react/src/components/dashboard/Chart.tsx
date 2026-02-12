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
import { useEffect } from 'react';

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
    gVar: any;
};

export const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top' as const,
        },
        title: {
            display: false,
            text: 'Chart.js Line Chart',
        },
    },
    animation: {
        duration: 0,
    },
    scales: {
        x: {
            grid: {
                color: 'rgba(255, 255, 255, 0.2)',
                lineWidth: 1
            }
        },
        y: {
            grid: {
                color: 'rgba(255, 255, 255, 0.2)',
                lineWidth: 1
            }
        }
    },
    interaction: {
        mode: 'nearest' as InteractionMode,
        intersect: false
    }
};

function Chart({ selectedVar, gVar }: varProps) {
    const timeKey = `${selectedVar}_time`;
    
    useEffect(() => {
        if (!gVar[timeKey] && Array.isArray(gVar[selectedVar])) {
            console.warn(`Missing time vector for array "${selectedVar}". This should be fixed in the backend.`);
        }
    }, [timeKey, selectedVar, gVar]);
    
    const timeVector = gVar[timeKey] || [];
    
    const earliestTime = timeVector.length > 0 ? Math.min(...timeVector) : 0;
    
    const formattedLabels = timeVector.map((timestamp: number) => {
        const elapsedMs = timestamp - earliestTime;
        return `${elapsedMs}`;
    });

    const data = {
        labels: formattedLabels,
        datasets: [
            {
                label: selectedVar,
                data: gVar[selectedVar] || [],
                borderColor: 'rgb(255, 255, 0)',               
                backgroundColor: 'rgb(255, 255, 0)',
                tension: 0.2,
                pointRadius: 2,
                pointBackgroundColor: 'rgb(255, 255, 0)',
                pointBorderColor: 'rgb(255, 255, 0)',
                borderWidth: 1
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


