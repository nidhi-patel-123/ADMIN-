import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function PerformanceCharts({ performances }) {
  // Fallback for empty or undefined performances
  const safePerformances = performances || [];

  // Function to categorize performance scores
  const getTasksCompletedCategory = (performance) => {
    if (performance >= 0 && performance <= 30)
      return { label: 'Bad', color: '#C2DCF0' };
    if (performance > 30 && performance <= 60)
      return { label: 'Good', color: '#eab308' };
    if (performance > 60 && performance <= 90)
      return { label: 'Perfect', color: '#22c55e' };
    if (performance > 90 && performance <= 100)
      return { label: 'Excellent', color: '#113a69' };
    return { label: 'N/A', color: '#6b7280' };
  };

  // Prepare data for Doughnut Chart (Performance Distribution)
  const performanceCategories = {
    Bad: 0,
    Good: 0,
    Perfect: 0,
    Excellent: 0,
    'N/A': 0,
  };

  safePerformances.forEach((perf) => {
    const { label } = getTasksCompletedCategory(perf.performance || 0);
    performanceCategories[label]++;
  });

  const doughnutChartData = {
    labels: Object.keys(performanceCategories),
    datasets: [
      {
        data: Object.values(performanceCategories),
        backgroundColor: ['#C2DCF0', '#6FA0CC', '#113A69', '#091D33', '#0D2C4E'],
        borderColor: ['#C2DCF0', '#6FA0CC', '#16a34a', '#2563eb', '#4b5563'],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for Stacked Column Chart (Attendance, Leave, Tasks)
  const columnChartData = {
    labels: safePerformances.map((perf) => perf.employee?.name || 'Unknown'),
    datasets: [
      {
        label: 'Attendance (%)',
        data: safePerformances.map((perf) => perf.attendanceScore || 0),
        backgroundColor: '#6FA0CC',
        borderColor: '#111111',
        borderWidth: 1,
        borderRadius: 8,
      },
      {
        label: 'Leave (%)',
        data: safePerformances.map((perf) => perf.leaveScore || 0),
        backgroundColor: '#113a69',
        borderColor: '#1976D2',
        borderWidth: 1,
        borderRadius: 8,
      },
      {
        label: 'Tasks (%)',
        data: safePerformances.map((perf) => perf.taskScore || 0),
        backgroundColor: '#99BFDF',
        borderColor: '#FFA000',
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  // Shared chart options with customizations
  const chartOptions = (type, title, yAxisTitle, yMax = 100, yStepSize = 20) => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: type === 'bar' ? {
      y: {
        stacked: true,
        beginAtZero: true,
        max: yMax,
        title: {
          display: true,
          text: yAxisTitle,
          font: { size: 14, family: 'Arial' },
          color: '#113a69',
        },
        ticks: {
          stepSize: yStepSize,
          color: '#113a69',
          font: { size: 12, family: 'Arial' },
        },
        grid: {
          color: '#e5e7eb',
        },
      },
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Employees',
          font: { size: 14, family: 'Arial' },
          color: '#113a69',
        },
        ticks: {
          color: '#113a69',
          font: { size: 12, family: 'Arial' },
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          display: false,
        },
      },
    } : {},
    plugins: {
      legend: {
        position: type === 'bar' ? 'top' : 'bottom',
        labels: {
          color: '#113a69',
          font: { size: 12, family: 'Arial' },
          boxWidth: type === 'bar' ? 40 : 12,
        },
      },
      title: {
        display: true,
        text: title,
        font: { size: 16, family: 'Arial', weight: 'bold' },
        color: '#113a69',
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        backgroundColor: '#113a69',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        titleFont: { size: 12, family: 'Arial' },
        bodyFont: { size: 12, family: 'Arial' },
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || context.label;
            const value = context.parsed || context.raw || 0;
            return type === 'bar'
              ? `${label}: ${Number.isFinite(value) ? value.toFixed(2) : value}%`
              : `${label}: ${value} employees`;
          },
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const element = elements[0];
        const datasetIndex = element.datasetIndex;
        const index = element.index;
        if (type === 'bar') {
          const employee = safePerformances[index]?.employee?.name || 'Unknown';
          const datasetLabel = columnChartData.datasets[datasetIndex].label;
          const value = columnChartData.datasets[datasetIndex].data[index] || 0;
          console.log(`Clicked: ${employee} - ${datasetLabel}: ${value}%`);
        } else {
          const category = doughnutChartData.labels[index];
          const value = doughnutChartData.datasets[0].data[index] || 0;
          console.log(`Clicked: ${category} - ${value} employees`);
        }
      }
    },
  });

  return (
    <div className="w-full rounded-2xl shadow-lg p-8 sm:p-8 bg-white mt-10">
      <h3 className="text-lg sm:text-xl font-medium text-[#113a69] mb-6">
        Employee Performance Analytics
      </h3>
      {safePerformances.length === 0 ? (
        <p className="text-center py-6 text-gray-500 text-sm sm:text-base">
          No performance data available.
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Doughnut Chart: Performance Distribution */}
          <div className="h-64 sm:h-80 w-full">
            <h4 className="text-base sm:text-lg font-semibold text-[#113a69] mb-4">
              Performance Distribution
            </h4>
            <Doughnut
              data={doughnutChartData}
              options={chartOptions('doughnut', 'Employee Performance Distribution', '')}
            />
          </div>
          {/* Stacked Column Chart: Performance Metrics */}
          <div className="h-64 sm:h-80 w-full mb-6">
            <h4 className="text-base sm:text-lg font-semibold text-[#113a69] mb-4">
              Performance Metrics (%)
            </h4>
            <Bar
              data={columnChartData}
              options={chartOptions('bar', 'Employee Performance Metrics', 'Score (%)', 100, 20)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default PerformanceCharts;