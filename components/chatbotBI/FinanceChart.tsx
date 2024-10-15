import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

interface DailyFinanceData {
  DailyAmount: string;
  Day: number;
}

interface MonthlyFinanceData {
  Month: number;
  TotalAmount: string;
}

type FinanceData = DailyFinanceData | MonthlyFinanceData;

interface FinanceChartProps {
  data: FinanceData[];
  chartType: "line" | "spline" | "area" | "column" | "bar" | "pie" | "scatter";
}

const FinanceChart: React.FC<FinanceChartProps> = ({ data, chartType }) => {
  const isMonthlyData = (entry: FinanceData): entry is MonthlyFinanceData => {
    return (entry as MonthlyFinanceData).Month !== undefined;
  };

  const chartData = data.map((entry) => {
    if (isMonthlyData(entry)) {
      return {
        x: entry.Month - 1,
        y: parseFloat(entry.TotalAmount),
      };
    } else {
      return {
        x: entry.Day - 1,
        y: parseFloat(entry.DailyAmount),
      };
    }
  });

  const isPieChart = chartType === "pie";
  const pieData = data.map((entry) => {
    if (isMonthlyData(entry)) {
      return {
        name: `${entry.Month}`,
        y: parseFloat(entry.TotalAmount),
      };
    } else {
      return {
        name: `${entry.Day}`,
        y: parseFloat(entry.DailyAmount),
      };
    }
  });

  const colors = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#F3FF33",
    "#FF33A1",
    "#A133FF",
    "#33FFF7",
    "#FF8C00",
    "#FFD700",
    "#6A5ACD",
    "#FF1493",
    "#20B2AA",
    "#FF4500",
    "#DA70D6",
    "#ADFF2F",
    "#7FFF00",
    "#1E90FF",
    "#FF6347",
    "#4682B4",
    "#FF69B4",
    "#8B4513",
    "#D2691E",
    "#B22222",
    "#FFB6C1",
    "#8A2BE2",
    "#FFE4E1",
    "#7B68EE",
    "#CD5C5C",
    "#FFDAB9",
    "#90EE90",
    "#DDA0DD",
    "#B0E0E6",
    "#C71585",
  ];

  const coloredChartData = chartData.map((point, index) => ({
    ...point,
    color: colors[index % colors.length],
  }));

  const options = {
    chart: {
      type: chartType,
    },
    title: {
      text: chartType,
    },
    xAxis: !isPieChart
      ? {
          title: {
            text: isMonthlyData(data[0]) ? "Month" : "Day",
          },
          categories: data.map((entry) => {
            return isMonthlyData(entry) ? `${entry.Month}` : `${entry.Day}`;
          }),
        }
      : undefined,
    yAxis: !isPieChart
      ? {
          title: {
            text: "Total Amount",
          },
          labels: {
            formatter: function () {
              const value = (
                this as unknown as Highcharts.AxisLabelsFormatterContextObject
              ).value as number;
              if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
              if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
              if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
              if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
              return value.toString();
            },
          },
        }
      : undefined,
    tooltip: {
      pointFormatter: function () {
        const value = (this as unknown as Highcharts.Point).y as number;
        if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
        if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
        if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
        if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
        return value.toString();
      },
    },
    series: [
      {
        name: "Total Credit",
        data: isPieChart ? pieData : coloredChartData,
        colorByPoint: isPieChart,
      },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default FinanceChart;
