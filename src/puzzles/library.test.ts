import { loadPuzzles, parseBoard } from './library';
import type { PlaintextPuzzle } from './plaintext';

describe('parseBoard', () => {
  it('parses cells between row bars and discards surrounding text', () => {
    const board = parseBoard(`
      discarded title
      left | X01 | right

      ignored because it has no bars
      prefix |234  | suffix
    `);

    expect(board).toEqual([
      [
        { cell_type: 'floor' },
        { cell_type: 'wall', number: undefined },
        { cell_type: 'wall', number: 0 },
        { cell_type: 'wall', number: 1 },
        { cell_type: 'floor' },
      ],
      [
        { cell_type: 'wall', number: 2 },
        { cell_type: 'wall', number: 3 },
        { cell_type: 'wall', number: 4 },
        { cell_type: 'floor' },
        { cell_type: 'floor' },
      ],
    ]);
  });

  it('throws for invalid cell characters inside bars', () => {
    expect(() => parseBoard('| A |')).toThrow('Invalid cell character: A');
  });
});

describe('loadPuzzles', () => {
  it('loads names and parsed boards from plaintext puzzles', () => {
    const plaintextPuzzles: PlaintextPuzzle[] = [
      {
        name: 'Tiny puzzle',
        board: `
          |X |
          | 2|
        `,
      },
    ];

    expect(loadPuzzles(plaintextPuzzles)).toEqual([
      {
        name: 'Tiny puzzle',
        board: [
          [{ cell_type: 'wall', number: undefined }, { cell_type: 'floor' }],
          [{ cell_type: 'floor' }, { cell_type: 'wall', number: 2 }],
        ],
      },
    ]);
  });
});
