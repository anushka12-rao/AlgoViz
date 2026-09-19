import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="app-footer" role="contentinfo">
      <p>&copy; {new Date().getFullYear()} AlgoViz &bull; Headless C++ Execution Engine &bull; Interactive Algorithm Visualizer</p>
    </footer>
  );
};
