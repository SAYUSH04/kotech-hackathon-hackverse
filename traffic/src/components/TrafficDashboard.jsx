import React from 'react';

const TrafficDashboard = ({ data }) => {
  const countByLevel = {
    High: 0,
    Medium: 0,
    Low: 0
  };

  data.forEach(item => {
    if (countByLevel[item.level] !== undefined) {
      countByLevel[item.level]++;
    }
  });

  const cardStyle = (color) => ({
    backgroundColor: color,
    color: 'white',
    padding: '15px',
    borderRadius: '10px',
    width: '150px',
    textAlign: 'center',
    boxShadow: '0px 2px 6px rgba(0,0,0,0.2)',
    margin: '10px'
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
      <div style={cardStyle('red')}>
        <h3>{countByLevel.High}</h3>
        <p>High Congestion</p>
      </div>
      <div style={cardStyle('orange')}>
        <h3>{countByLevel.Medium}</h3>
        <p>Medium Congestion</p>
      </div>
      <div style={cardStyle('green')}>
        <h3>{countByLevel.Low}</h3>
        <p>Low Congestion</p>
      </div>
    </div>
  );
};

export default TrafficDashboard;
