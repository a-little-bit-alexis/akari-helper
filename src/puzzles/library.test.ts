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

    expect(board.cells).toEqual([
      [{}, { wall: true }, { wall: true, number: 0 }, { wall: true, number: 1 }, {}],
      [{ wall: true, number: 2 }, { wall: true, number: 3 }, { wall: true, number: 4 }, {}, {}],
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
        board: {
          cells: [
            [{ wall: true }, {}],
            [{}, { wall: true, number: 2 }],
          ],
        },
      },
    ]);
  });
});
