export interface PlaintextPuzzle {
  name: string;
  board: string;
}

export const PLAINTEXT_PUZZLES: PlaintextPuzzle[] = [
  {
    name: 'advanced-10x10-2-1',
    board: `
|X   X1   1|
|          |
|          |
|  X XX 1  |
| 2      X |
|          |
|   4  X   |
| X  X0  2 |
|X        1|
|X        1|
`,
  },
  {
    name: 'advanced-10x10-2-2',
    board: `
|     X    |
|  X   X1  |
| X  0   X |
|          |
|2      X  |
| X  3  00 |
|   4      |
|X      1  |
|  1   X   |
|   1  2  X|
`,
  },
  {
    name: 'advanced-10x10-2-3',
    board: `
|   2   X0 |
|  X       |
|X      0  |
| 2  XX  XX|
|    0     |
|          |
|  X  1  X |
| 2X  X1  1|
|          |
|   0    3 |
`,
  },
  {
    name: 'advanced-10x10-2-4',
    board: `
|X  1    X |
|X      1  |
|      0  0|
| X X0     |
|3      X  |
|      2  0|
|   X X    |
|  2     X |
| 1  3   3 |
|    X  2  |
`,
  },
  {
    name: 'advanced-10x10-2-5',
    board: `
|X       X |
|    X     |
|   1   1  |
|  1     3 |
|  3   3   |
|     0    |
| 2      X |
|  X    1  |
|   3  0   |
|X        X|
`,
  },
  {
    name: 'beginner-10x10-3-1',
    board: `
|     X    |
| 12  X  2 |
|  X     1 |
|     1    |
|X  X   X  |
|X  X  2  X|
|          |
|X   3    X|
|  3  3X  1|
|   X      |
`,
  },
  {
    name: 'beginner-10x10-3-2',
    board: `
|     X   X|
| 0  X   X |
| 0  X  2  |
|       X  |
|XX  1   X |
| X  X    1|
|  2    1  |
| X     X  |
| 2   3  3 |
|  2  XX  X|
`,
  },
  {
    name: 'beginner-10x10-3-3',
    board: `
| X   2    |
|  X     XX|
|     0X   |
|1         |
|  1      2|
|   0  X1  |
|          |
| X       X|
|2  X1  4  |
|      X   |
`,
  },
  {
    name: 'beginner-10x10-3-4',
    board: `
|   X     1|
|  X       |
|2    XX 1 |
|         1|
| X2       |
|   X  2   |
|     X   2|
|  X     X |
| 1  3     |
| 2   2  1 |
`,
  },
  {
    name: 'beginner-10x10-3-5',
    board: `
|     1  3 |
|X      X  |
| XX X0  3 |
|   0      |
|       X  |
|  2   2  X|
|X X   X   |
|   X   X  |
|     4  X |
| 1X   3  1|
`,
  },
  {
    name: 'expert-14x14-3-1',
    board: `
|X  1  X  0    |
|         0X 1 |
|  1   1      1|
| 0   X        |
|       0  X0  |
|  2           |
|X  X  0       |
|   1    0  00 |
|              |
|   0 1  X     |
|2   X  X  X0  |
|  2   0       |
|   X          |
|      1  2  2 |
`,
  },
  {
    name: 'expert-14x14-3-2',
    board: `
|X     XX     X|
|   0  11  2   |
|  X2      XX  |
|2            X|
|      XX      |
| XX X    1 11 |
|   1      X   |
|      X1      |
|X  1  XX  0  1|
|              |
|  1        2  |
| 1  0    X  X |
|      X0      |
|1  0      1  2|
`,
  },
  {
    name: 'expert-14x14-3-3',
    board: `
| X  X  X   1 X|
|2      X1     |
|    0      1  |
|   11  2  X 10|
| X     X2     |
|1     1       |
|    X    2  10|
| X X   1   X  |
|0     0   X   |
|      X  X   1|
|   2       X  |
| X2  X  X   0 |
|2     1 02    |
|     0     1 1|
`,
  },
  {
    name: 'expert-14x14-3-4',
    board: `
| 2    X  X    |
|  2    0  X  0|
|  0X 1X   00 X|
|      1       |
|XX      X     |
|  00 X   X  X1|
|      2  X 2  |
|X X   X   X   |
| 0X  1    2  X|
|       X     X|
|    X  2  XX  |
|X 2X  X   X   |
| X  2   X    0|
|1    1 2   1 X|
`,
  },
  {
    name: 'expert-14x14-3-5',
    board: `
| X  1         |
|       2      |
|    X   2  01 |
| X2  0   2    |
|       1      |
|      X   0  1|
|  1X  0   X   |
|  2    X      |
|        X  2 X|
| 2   0        |
|  2  1  0     |
| 1        2  0|
|         2    |
| X  2  X      |
`,
  },
  {
    name: 'genius-2-puzzle-1',
    board: `
| X     X       X X1    X |
|  X   X X X      1       |
|  X  00   X     2X  1    |
|1 1      0X  1  X     1X |
|     X   1  10     X 02  |
|       1                 |
| 1  0 0  0 XX     X  X   |
|  1   0    1    1        |
|              0      X   |
|X  XX 0 1      0    1X   |
|          X0           X |
|XX   0   X  X            |
| 2   0  0       X     XX2|
|   0     X  X1X  X 2X X1 |
|   X   11     X  X   0   |
|     X                   |
|0 2        1        1   0|
|X2   1 0    2    0 X     |
|        X    2X  0  1    |
|   X       X X      1    |
|        3   X        2   |
|   10  2 X  X   1X  0  XX|
| X          X     0 X 0  |
|  X 0     X    2       X |
|1        X  2   1  1     |
`,
  },
];
