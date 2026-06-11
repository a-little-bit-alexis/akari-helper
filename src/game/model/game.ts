import type { Index } from './board';

export type CellValue = 'empty' | 'xMark' | 'bulb';

export type Move =
  | {
      index: Index;
      type: 'ChangeCellValue';
      from: CellValue;
      to: CellValue;
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
