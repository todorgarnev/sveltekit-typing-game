import { writable } from "svelte/store";
import type { Game } from "$lib/types/types";

export const game = writable<Game>("waiting for input");
export const timer = writable<number>(3);
export const toggleReset = writable<boolean>(false);
export const correctLetters = writable<number>(0);
export const letterIndex = writable<number>(0);
export const typedLetter = writable<string>("");
export const wordIndex = writable<number>(0);