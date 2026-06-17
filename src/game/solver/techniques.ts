import type { Board } from '../model/Board';
import type { CellInputValue } from '../model/Cell';
import type { Index } from '../model/CellIndex';
import { L0_Techniques } from './l0';
import { L1_Techniques } from './l1';
import { L2_Techniques } from './l2';

export interface SolverMove {
  index: Index;
  value: CellInputValue;
}

export interface SolverAnnotation {
  index: Index;
  label?: string;
  color: string;
}

export interface SolverRecommendation {
  moves: SolverMove[];
  explanation: string;
  annotations?: SolverAnnotation[];
  complexity: number;
}

export interface SolverConfig {
  maxComplexity: number;
}

export interface Technique {
  name: string;
  getRecommendation: (board: Board, config: SolverConfig) => SolverRecommendation | undefined;
  minComplexity: number;
}

export const ALL_TECHNIQUES: Technique[] = [
  ...L0_Techniques,
  ...L1_Techniques,
  ...L2_Techniques,
].sort((a, b) => a.minComplexity - b.minComplexity);

export function getRecommendation(
  board: Board,
  config: SolverConfig,
): SolverRecommendation | undefined {
  for (const technique of ALL_TECHNIQUES) {
    const recommendation = technique.getRecommendation(board, config);
    if (recommendation !== undefined) {
      return recommendation;
    }
  }

  return undefined;
}
