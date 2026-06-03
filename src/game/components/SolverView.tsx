import { SolverAnalysis } from './SolverAnalysis';
import { SolverHistory } from './SolverHistory';

export function SolverView() {
  return (
    <div className="solver-view">
      <div className="solver-view-section">
        <SolverAnalysis />
      </div>
      <div className="solver-view-section">
        <SolverHistory />
      </div>
    </div>
  );
}
