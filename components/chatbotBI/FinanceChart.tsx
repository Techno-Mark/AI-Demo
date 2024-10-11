import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register the necessary components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface FinanceData {
  Month: number;
  TotalAmount: string;
}

interface FinanceChartProps {
  data: FinanceData[];
}

const FinanceChart: React.FC<FinanceChartProps> = ({ data }) => {
  // Generate dynamic colors for each month
  const generateColors = (count: number) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const color = `hsl(${(i * 360) / count}, 70%, 50%)`; // Generates different hues for each bar
      colors.push(color);
    }
    return colors;
  };

  const barColors = generateColors(data.length);

  // Prepare the data for Chart.js
  const chartData = {
    labels: data.map((entry) => `Month ${entry.Month}`),
    datasets: [
      {
        label: "Total Credit",
        data: data.map((entry) => parseFloat(entry.TotalAmount)),
        backgroundColor: barColors, // Use generated colors
        borderColor: barColors,
        borderWidth: 1,
        barThickness: 40,
      },
    ],
  };

  // Function to format large numbers
  const formatValue = (value: number) => {
    if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toString();
  };

  // Optional configuration
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
      title: {
        display: true,
        text: "", // You can add a title if needed
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            return `${formatValue(value)}`; // Format tooltip values
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function (tickValue: string | number) {
            if (typeof tickValue === "number") {
              return formatValue(tickValue); // Format y-axis values
            }
            return tickValue; // For string values (although unlikely for y-axis)
          },
        },
      },
    },
  };

  return (
    <div style={{ height: "500px" }}>
      {" "}
      {/* Set the desired height here */}
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default FinanceChart;
