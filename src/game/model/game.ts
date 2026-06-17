import type { CellInputValue } from './Cell';
import type { Index } from './CellIndex';

export type Move =
  | {
      index: Index;
      type: 'ChangeCellValue';
      from: CellInputValue;
      to: CellInputValue;
    }
  | {
      index: Index;
      type: 'ChangeHighlight';
      from: string | undefined;
      to: string | undefined;
    }
  | {
      type: 'CompoundMove';
      moves: Move[];
    };
