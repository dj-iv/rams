import React from 'react';

// Define the standard 5x5 levels
const severityLevels = ['Catastrophic', 'Major', 'Moderate', 'Minor', 'Insignificant'];
const likelihoodLevels = ['Very Unlikely', 'Unlikely', 'Possible', 'Likely', 'Very Likely'];

// Define the risk level for each cell (0=Green, 1=Yellow, 2=Orange, 3=Red)
// This creates the standard color pattern for a 5x5 matrix.
const riskGridColors = [
  [1, 2, 3, 3, 3], // Row for Catastrophic
  [1, 2, 2, 3, 3], // Row for Major
  [0, 1, 2, 2, 3], // Row for Moderate
  [0, 1, 1, 2, 2], // Row for Minor
  [0, 0, 1, 1, 2], // Row for Insignificant
];

const riskColorMap = {
  0: '#66bb6a', // Green
  1: '#ffca28', // Yellow
  2: '#ffa726', // Orange
  3: '#ef5350', // Red
};


const RiskMatrix = ({ title, severity, likelihood }) => {
  // Find the coordinates of the 'X' using a case-insensitive comparison
  // FIX: Convert props to strings before calling .toLowerCase() to prevent errors
  const severityIndex = severity ? severityLevels.findIndex(level => level.toLowerCase() === String(severity).toLowerCase()) : -1;
  const likelihoodIndex = likelihood ? likelihoodLevels.findIndex(level => level.toLowerCase() === String(likelihood).toLowerCase()) : -1;

  return (
    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
      <h4 style={{ fontWeight: 'normal', fontSize: '12px', marginBottom: '0.5rem' }}>{title}</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', gap: '5px' }}>
        {/* Vertical Severity Label */}
        <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: '10px', fontWeight: 'bold', alignSelf: 'stretch', display: 'flex', alignItems: 'center' }}>Severity</div>
        
        {/* Main Grid Container */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(5, 1fr)', gap: '2px' }}>
          {/* Severity Row Labels */}
          {severityLevels.map((level, sIndex) => (
            <div key={level} style={{ gridRow: sIndex + 1, gridColumn: '1', textAlign: 'right', paddingRight: '8px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              {level}
            </div>
          ))}

          {/* 5x5 Grid Cells */}
          {severityLevels.map((sLevel, sIndex) =>
            likelihoodLevels.map((lLevel, lIndex) => {
              const isTargetCell = sIndex === severityIndex && lIndex === likelihoodIndex;
              return (
                <div key={`${sIndex}-${lIndex}`} style={{
                  gridRow: sIndex + 1,
                  gridColumn: lIndex + 2,
                  backgroundColor: riskColorMap[riskGridColors[sIndex][lIndex]],
                  aspectRatio: '1 / 1', // This makes the cell a perfect square
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'black',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  border: '1px solid white'
                }}>
                  {isTargetCell && 'X'}
                </div>
              );
            })
          )}

          {/* Likelihood Column Labels */}
          <div style={{ gridRow: '6', gridColumn: '2 / span 5', textAlign: 'center', fontSize: '10px', fontWeight: 'bold', marginTop: '5px' }}>Likelihood</div>
          {likelihoodLevels.map((level, lIndex) => (
            <div key={level} style={{ gridRow: '7', gridColumn: lIndex + 2, fontSize: '10px', textAlign: 'center', padding: '4px 0' }}>
              {level}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RiskMatrix;