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
import type { Game, Word } from "$lib/types/types";

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

export const getWords = async (limit: number) => {
  const response = await fetch(`/api/words?limit=${limit}`);
  const json = await response.json();
  words.set(json);
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

const nextWord = () => {
  const isNotFirstLetter: boolean = get(letterIndex) !== 0;
  const isOneLetterWord: boolean = get(words)[get(wordIndex)].length === 1;

  if (isNotFirstLetter || isOneLetterWord) {
    wordIndex.set(get(wordIndex) + 1);
    letterIndex.set(0);
    increaseScore();
    moveCaret();
  }
};

const getWordsPerMinute = () => {
  const word = 5;
  const minutes = 0.5;
  return Math.floor(get(correctLetters) / word / minutes);
};

const getAccuracy = () => {
  const totalLetters = getTotalLetters(get(words));
  return Math.floor((get(correctLetters) / totalLetters) * 100);
};

const getTotalLetters = (words: Word[]) => {
  return words.reduce((count, word) => count + word.length, 0);
};

const increaseScore = () => {
  correctLetters.set(get(correctLetters) + 1);
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

const setLetter = () => {
  const isWordCompleted: boolean = get(letterIndex) > get(words)[get(wordIndex)].length - 1;

  if (!isWordCompleted) {
    letterEl.set(
      get(wordsEl).children[get(wordIndex)].children[
      get(letterIndex)
      ] as HTMLSpanElement
    );
  }
};

const checkLetter = () => {
  const currentLetter: string = get(words)[get(wordIndex)][get(letterIndex)];

  if (get(typedLetter) === currentLetter) {
    get(letterEl).dataset.letter = "correct";
    increaseScore();
  }

  if (get(typedLetter) !== currentLetter) {
    get(letterEl).dataset.letter = "incorrect";
  }
};

const resetLetter = () => {
  typedLetter.set("");
};

const nextLetter = () => {
  letterIndex.set(get(letterIndex) + 1);
};

const updateLine = () => {
  const wordEl = get(wordsEl).children[get(wordIndex)];
  const wordsY = get(wordsEl).getBoundingClientRect().y;
  const wordY = wordEl.getBoundingClientRect().y;

  if (wordY > wordsY) {
    wordEl.scrollIntoView({ block: "center" });
  }
};

const moveCaret = () => {
  const offset = 4;
  get(caretEl).style.top = `${get(letterEl).offsetTop + offset}px`;
  get(caretEl).style.left = `${get(letterEl).offsetLeft + get(letterEl).offsetWidth}px`;
};