import React from 'react';

export default function ActiveProjectsCard() {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', maxWidth: '400px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#1A202C', fontWeight: 500 }}>My Active Projects</h3>
        <span style={{ color: '#8B5CF6', fontSize: '14px', fontWeight: 500 }}>View All</span>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Project 1 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '15px', color: '#2D3748', flex: 1 }}>Website Redesign</span>
          <div style={{ width: '100px', height: '6px', backgroundColor: '#EDF2F7', borderRadius: '4px', margin: '0 16px' }}>
            <div style={{ width: '38%', height: '100%', backgroundColor: '#8B5CF6', borderRadius: '4px' }}></div>
          </div>
          <span style={{ fontSize: '14px', color: '#4A5568', minWidth: '32px', textAlign: 'right' }}>38%</span>
        </div>
        
        {/* Project 2 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '15px', color: '#2D3748', flex: 1 }}>E-Commerce Platform</span>
          <div style={{ width: '100px', height: '6px', backgroundColor: '#EDF2F7', borderRadius: '4px', margin: '0 16px' }}>
            <div style={{ width: '0%', height: '100%', backgroundColor: '#8B5CF6', borderRadius: '4px' }}></div>
          </div>
          <span style={{ fontSize: '14px', color: '#4A5568', minWidth: '32px', textAlign: 'right' }}>0%</span>
        </div>
      </div>
    </div>
  );
}
