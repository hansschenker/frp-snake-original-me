import { COLS, ROWS } from "./constants";
import { Direction } from "./index";

const range = (l) => [...Array(l).keys()];

export function initSnake(length) {
  return range(length).map((i) => ({ x: i, y: 0 }));
}

export function trackSnake(snake, { direction, applesCount }) {
  const head = snake[0];

  const newHead = {
    x: head.x + direction.x,
    y: head.y + direction.y,
  };

  const ateApple = applesCount > snake.length;

  const newBody = ateApple ? snake : snake.slice(0, -1);

  return [newHead, ...newBody].map(withinBounds);
}

export function trackDirection(previous: Direction, next: Direction) {
  const isOpposite = (previous, next) =>
    next.x === -previous.x || next.y === -previous.y;

  return isOpposite(previous, next) ? previous : next;
}

export function trackApplesPosition(apples: Direction[], snake: Direction[]) {
  const head = snake[0];
  const withoutEaten = apples.filter((apple) => !checkCollision(head, apple));
  const wasEaten = withoutEaten.length < apples.length;
  const added = wasEaten ? [getRandomPosition(snake)] : [];
  return [...withoutEaten, ...added];
}

export function initApplesPosition(count): Direction[] {
  return range(count).map(() => getRandomPosition());
}

function getRandomPosition(snake: Direction[] = []) {
  const position = {
    x: getRandomNumber(0, COLS - 1),
    y: getRandomNumber(0, ROWS - 1),
  };

  return isEmptyCell(position, snake) ? position : getRandomPosition(snake);
}

function isEmptyCell(position, snake) {
  return !snake.some((segment) => checkCollision(segment, position));
}

function checkCollision(a, b) {
  return a.x === b.x && a.y === b.y;
}

export function noSnakeCollision(snake: Direction[] = []) {
  const [head, ...tail] = snake;
  return !tail.some((part) => checkCollision(part, head));
}

export function withinBounds(point) {
  const x = point.x >= COLS ? 0 : point.x < 0 ? COLS - 1 : point.x;

  const y = point.y >= ROWS ? 0 : point.y < 0 ? ROWS - 1 : point.y;

  return { x, y };
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function compareObjects(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
