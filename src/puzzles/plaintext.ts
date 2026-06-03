export interface PlaintextPuzzle {
  name: string;
  board: string;
}

export const PLAINTEXT_PUZZLES: PlaintextPuzzle[] = [
  {
    name: 'Expert 2 - 14x14 - Puzzle 06',
    board: `
            |     X  X     |
            | 0  10  10  X |
            |  X        0  |
            | X          X |
            |X    X  X    X|
            |  1   30   0  |
            | X          X |
            |3  2      X  1|
            |  X   XX   2  |
            |              |
            |X  X      X  0|
            | X  1 10 2  1 |
            |  2   XX   X  |
            |              |`,
  },
];
