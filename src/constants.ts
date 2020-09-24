import { Direction } from "./index";
export const COLS = 30;
export const ROWS = 30;
export const GAP_SIZE = 1;
export const CELL_SIZE = 10;
export const INITIAL_SNAKE_LENGTH = 3;
export const APPLE_COUNT = 2;
export const POINTS_PER_APPLE = 1;
export const GROW_PER_APPLE = 1;
export const SPEED = 100;
export const DIRECTIONS = {
  37: { x: -1, y: 0 }, // left (clockwise)
  38: { x: 0, y: -1 }, // up
  39: { x: 1, y: 0 }, // right
  40: { x: 0, y: 1 }, // down
};
export const INITIAL_DIRECTION: Direction = DIRECTIONS[40];
