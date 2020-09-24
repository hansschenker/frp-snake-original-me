import {
  Observable,
  BehaviorSubject,
  combineLatest,
  fromEvent,
  interval,
  animationFrameScheduler,
} from "rxjs";
import {
  distinctUntilChanged,
  filter,
  map,
  mapTo,
  scan,
  share,
  skip,
  startWith,
  take,
  takeWhile,
  tap,
  withLatestFrom,
} from "rxjs/operators";

import { createCanvasElement, render } from "./canvas";
import {
  initApplesPosition,
  initSnake,
  trackSnake,
  trackDirection,
  trackApplesPosition,
  noSnakeCollision,
  compareObjects,
} from "./functions";
import {
  INITIAL_SNAKE_LENGTH,
  APPLE_COUNT,
  POINTS_PER_APPLE,
  GROW_PER_APPLE,
  SPEED,
  DIRECTIONS,
  INITIAL_DIRECTION,
} from "./constants";

const canvas = createCanvasElement();
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

export interface Direction {
  x: number;
  y: number;
}
console.clear();
// *** sources: ticks and keys
// tick source: emits every SPEED ms a number
const tickChange$: Observable<number> = interval(
  SPEED,
  animationFrameScheduler
);
// arrow keys: emits keyboard events
const keyDownChange$: Observable<KeyboardEvent> = fromEvent<KeyboardEvent>(
  document.body,
  "keydown"
);
// *** directions from keys
// map the arrow key to a direction: +x or -x, +y or -y
// discard all other keys (only 37, 38, 39, 40)
// save previous direction and nex direction
// keep direction until it changes
// output: direction {x: +/-1 or 0, y: +/-1 or 0}
const directionChange$: Observable<Direction> = keyDownChange$.pipe(
  map((e: KeyboardEvent) => DIRECTIONS[e.keyCode]),
  filter(Boolean),
  startWith(INITIAL_DIRECTION),
  scan(trackDirection),
  distinctUntilChanged()
);

// track apples count state and change
const applesCountState$ = new BehaviorSubject(0);
// const trackApples = subject holds last value
// for state tracking in scan
type TrackState<T> = (acc: T, curr: T) => (newAcc: T, initialValue: T) => T;

const applesCountChange$: Observable<number> = applesCountState$.pipe(
  scan((applesCount, grow) => applesCount + grow, INITIAL_SNAKE_LENGTH)
);

// whenever the tick changes
// take the direction
const snakeChange$: Observable<Direction[]> = tickChange$.pipe(
  withLatestFrom(
    directionChange$,
    applesCountChange$,
    (_, direction, applesCount) => ({
      direction,
      applesCount,
    })
  ),
  scan(trackSnake, initSnake(INITIAL_SNAKE_LENGTH)),
  tap((v) => console.log("sanke-state:", v))
);

// when the snakes moves we check if the snake
// has eaten an apple
const applesPositionChange$: Observable<Direction[]> = snakeChange$.pipe(
  scan(trackApplesPosition, initApplesPosition(APPLE_COUNT)),
  distinctUntilChanged(compareObjects),
  share()
);

// when an apple is eaten the score changes
// the apple count chaanges
const applesEaten$ = applesPositionChange$
  .pipe(skip(1), mapTo(GROW_PER_APPLE))
  .subscribe((v) => applesCountState$.next(v));

const scoreChange$: Observable<number> = applesCountState$.pipe(
  skip(1),
  startWith(0),
  scan((score, _) => score + POINTS_PER_APPLE),
  tap((v) => console.log("score-state:", v))
);

// game logic is a combination of the
// snake moving and trying to eat apples
interface Scene {
  snake: Direction[];
  apples: Direction[];
  score: number;
}
const sceneChange$ = combineLatest(
  snakeChange$,
  applesPositionChange$,
  scoreChange$,
  (snake, apples, score) => ({ snake, apples, score })
);

const game$ = tickChange$.pipe(
  withLatestFrom(sceneChange$, (_, scene) => scene),
  takeWhile((scene) => noSnakeCollision(scene.snake))
);

game$.subscribe((scene) => render(ctx, scene));
