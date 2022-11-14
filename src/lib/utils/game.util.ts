import { get } from "svelte/store";
import {
  game,
  words,
  typedLetter,
  correctLetters,
  wordsPerMinute,
  accuracy,
  toggleReset,
  timer,
  wordIndex,
  letterIndex,
  letterEl,
  wordsEl,
  caretEl,
  inputEl
} from "$lib/stores";
import {
  checkLetter,
  getTotalLetters,
  getWords,
  getWordsPerMinute,
  moveCaret,
  nextLetter,
  nextWord,
  resetLetter,
  setLetter,
} from "./words.util";
import type { Game } from "$lib/types/types";

export const handleKeydown = (event: KeyboardEvent) => {
  if (event.code === "Space") {
    event.preventDefault();

    if (get(game) === "in progress") {
      nextWord();
    }
  }

  if (get(game) === "waiting for input") {
    startGame();
  }
};

export const resetGame = () => {
  toggleReset.set(!get(toggleReset));

  setGameState("waiting for input");
  getWords(100);

  timer.set(30);
  typedLetter.set("");
  wordIndex.set(0);
  letterIndex.set(0);
  correctLetters.set(0);

  wordsPerMinute.set(0);
  accuracy.set(0);
};

export const focusInput = () => {
  get(inputEl).focus();
};

export const updateGameState = () => {
  setLetter();
  checkLetter();
  nextLetter();
  resetLetter();
  updateLine();
  moveCaret();
};

const getAccuracy = () => {
  const totalLetters = getTotalLetters(get(words));
  return Math.floor((get(correctLetters) / totalLetters) * 100);
};

const startGame = () => {
  setGameState("in progress");
  setGameTimer();
};

const setGameTimer = () => {
  const gameTimer = () => {
    if (get(timer) > 0) {
      timer.set(get(timer) - 1);
    }

    if (get(game) === "waiting for input" || get(timer) === 0) {
      clearInterval(interval);
    }

    if (get(timer) === 0) {
      setGameState("game over");
      getResults();
    }
  };

  const interval = setInterval(gameTimer, 1000);
};

const setGameState = (state: Game) => {
  game.set(state);
};

const getResults = () => {
  wordsPerMinute.set(getWordsPerMinute());
  accuracy.set(getAccuracy());
};

const updateLine = () => {
  const wordEl = get(wordsEl).children[get(wordIndex)];
  const wordsY = get(wordsEl).getBoundingClientRect().y;
  const wordY = wordEl.getBoundingClientRect().y;

  if (wordY > wordsY) {
    wordEl.scrollIntoView({ block: "center" });
  }
};
