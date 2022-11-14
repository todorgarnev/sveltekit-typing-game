import { get } from "svelte/store";
import {
  words,
  typedLetter,
  correctLetters,
  wordIndex,
  letterIndex,
  letterEl,
  wordsEl,
  caretEl,
} from "$lib/stores";
import type { Word } from "$lib/types/types";

export const getWords = async (limit: number) => {
  const response = await fetch(`/api/words?limit=${limit}`);
  const json = await response.json();
  words.set(json);
};

export const nextWord = () => {
  const isNotFirstLetter: boolean = get(letterIndex) !== 0;
  const isOneLetterWord: boolean = get(words)[get(wordIndex)].length === 1;

  if (isNotFirstLetter || isOneLetterWord) {
    wordIndex.set(get(wordIndex) + 1);
    letterIndex.set(0);
    increaseScore();
    moveCaret();
  }
};

export const getWordsPerMinute = () => {
  const word = 5;
  const minutes = 0.5;
  return Math.floor(get(correctLetters) / word / minutes);
};

export const getTotalLetters = (words: Word[]) => {
  return words.reduce((count, word) => count + word.length, 0);
};

export const setLetter = () => {
  const isWordCompleted: boolean =
    get(letterIndex) > get(words)[get(wordIndex)].length - 1;

  if (!isWordCompleted) {
    letterEl.set(
      get(wordsEl).children[get(wordIndex)].children[
        get(letterIndex)
      ] as HTMLSpanElement
    );
  }
};

export const checkLetter = () => {
  const currentLetter: string = get(words)[get(wordIndex)][get(letterIndex)];

  if (get(typedLetter) === currentLetter) {
    get(letterEl).dataset.letter = "correct";
    increaseScore();
  }

  if (get(typedLetter) !== currentLetter) {
    get(letterEl).dataset.letter = "incorrect";
  }
};

export const resetLetter = () => {
  typedLetter.set("");
};

export const nextLetter = () => {
  letterIndex.set(get(letterIndex) + 1);
};

export const moveCaret = () => {
  const offset = 4;
  get(caretEl).style.top = `${get(letterEl).offsetTop + offset}px`;
  get(caretEl).style.left = `${
    get(letterEl).offsetLeft + get(letterEl).offsetWidth
  }px`;
};

const increaseScore = () => {
  correctLetters.set(get(correctLetters) + 1);
};
