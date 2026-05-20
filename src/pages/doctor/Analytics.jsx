import React from 'react';

const Analytics = () => {
  return (
    <div className="animate-fade-in">
      <div className="dashboard-header flex justify-between items-center">
        <div>
          <h1 className="dashboard-title">Analytics</h1>
          <p className="dashboard-subtitle">Clinic performance and statistics</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="section-card animate-slide-up grid-left">
          <h2 className="section-title">Revenue Growth</h2>
          <div className="bar-chart mt-6" style={{ height: '200px' }}>
            <div className="bar" style={{ height: '50%' }}><span>Jan</span></div>
            <div className="bar" style={{ height: '70%' }}><span>Feb</span></div>
            <div className="bar" style={{ height: '90%' }}><span>Mar</span></div>
            <div className="bar" style={{ height: '60%' }}><span>Apr</span></div>
            <div className="bar" style={{ height: '100%' }}><span>May</span></div>
          </div>
        </div>

        <div className="section-card animate-slide-up grid-right" style={{ animationDelay: '0.1s' }}>
          <h2 className="section-title">Patient Demographics</h2>
          <div className="donut-chart-container mt-6">
            <div className="donut">
              <div className="donut-inner">
                <span className="donut-value">60%</span>
                <span className="donut-label">Dogs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
