# Akari

## Definition

The following definition is adapted from Wikipedia:

```
Akari is a binary-determination logic puzzle.

Akari is played on a rectangular grid of white and black cells. The player places light bulbs in white cells such that no two bulbs shine on each other, until the entire grid is lit up. A bulb sends rays of light horizontally and vertically, illuminating its entire row and column unless its light is blocked by a black cell. A black cell may have a number on it from 0 to 4, indicating how many bulbs must be placed adjacent to its four sides; for example, a cell with a 4 must have four bulbs around it, one on each side, and a cell with a 0 cannot have a bulb next to any of its sides. An unnumbered black cell may have any number of light bulbs adjacent to it, or none. Bulbs placed diagonally adjacent to a numbered cell do not contribute to the bulb count.
```

The terminology used in this project (akari-helper) is slightly different:

- A "black cell" is referred to here as a "wall"
- A "white cell" is any cell that is not a "wall"
- The "grid" is generally referred to as the "board"

##
