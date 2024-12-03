import React, { useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import '../css/DonutChart.css';

// Register components of ChartJS
ChartJS.register(ArcElement, Tooltip, Legend);

export const DonutChart = ({ progress }) => {
  const [isPopupVisible, setIsPopupVisible] = useState(false); // State for controlling the popup visibility

  const data = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        label: 'Progress',
        data: [progress, 100 - progress],
        backgroundColor: ['#9ccc65', '#f44336'],
        hoverBackgroundColor: ['#8bc34a', '#e57373'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    maintainAspectRatio: false,
  };

  const togglePopup = () => {
    setIsPopupVisible(!isPopupVisible); // Toggle the popup visibility
  };

  return (
    <div style={{ textAlign: 'center', position: 'relative', width: '170px', height: '200px' }}>
      <Doughnut data={data} options={options} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#f44336',
        pointerEvents: 'none', // Prevent interaction with the text
      }}>
        {Math.round(progress)}%
      </div>
      <div style={{ marginTop: '10px', fontSize: '20px', color: '#11009E' }}>
        Your Progress
      </div>
    </div>
  );
};

export default DonutChart;
