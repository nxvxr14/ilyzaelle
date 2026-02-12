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
    ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useEffect, useRef } from 'react';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    zoomPlugin
);

type ScrollableChartProps = {
    selectedVar: string;
    gVar: any;
    title?: string;
    /** Timestamp base para calcular el eje X. Si no se pasa, usa el mínimo del vector tiempo recibido. */
    baseEarliestTime?: number;
};

function ScrollableChart({ selectedVar, gVar, title, baseEarliestTime }: ScrollableChartProps) {
    const chartRef = useRef(null);
    const timeKey = `${selectedVar}_time`;
    
    // Log available keys in gVar
    useEffect(() => {
        console.log('ScrollableChart rendering for variable:', selectedVar);
        console.log('Available keys in gVar:', Object.keys(gVar));
    }, [selectedVar, gVar]);
    
    const timeVector = gVar[timeKey] || [];
    
    // Usar el base proporcionado (dataset completo) o calcular del vector actual
    const earliestTime = baseEarliestTime ?? (timeVector.length > 0 ? Math.min(...timeVector) : 0);
    
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

    // Reset zoom when component unmounts or variable changes
    useEffect(() => {
        return () => {
            if (chartRef.current) {
                const chartInstance = (chartRef.current as any).chartInstance;
                if (chartInstance) {
                    chartInstance.resetZoom();
                }
            }
        };
    }, [selectedVar]);

    // Configure chart options with zoom and pan enabled
    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: 'white',
                },
            },
            title: {
                display: true,
                text: title || `Histórico completo: ${selectedVar}`,
                color: 'white',
            },
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'x',
                    threshold: 5,
                },
                zoom: {
                    wheel: {
                        enabled: true,
                    },
                    pinch: {
                        enabled: true
                    },
                    mode: 'x',
                }
            },
            tooltip: {
                callbacks: {
                    title: function(tooltipItems) {
                        const ms = parseInt(tooltipItems[0].label);
                        return `Tiempo: ${ms}ms`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)',
                    lineWidth: 1
                },
                ticks: {
                    color: 'white',
                },
                title: {
                    display: true,
                    text: 'Tiempo (ms)',
                    color: 'white',
                }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)',
                    lineWidth: 1
                },
                ticks: {
                    color: 'white',
                },
                title: {
                    display: true,
                    text: 'Valor',
                    color: 'white',
                }
            }
        },
        interaction: {
            mode: 'nearest' as InteractionMode,
            intersect: false,
        },
        // Initial view showing the last 25 points
        animation: false,
    };

    return (
        <div className="w-full h-full">
            <Line ref={chartRef} options={options} data={data} />
            <div className="mt-2 text-center text-xs text-gray-300">
                <p>Usa la rueda del mouse o arrastra para navegar. Doble clic para restaurar la vista.</p>
            </div>
        </div>
    );
}

export default ScrollableChart;
