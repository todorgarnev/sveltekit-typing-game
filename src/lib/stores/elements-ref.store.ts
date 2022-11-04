import { writable } from "svelte/store";

export const wordsEl = writable<HTMLDivElement>();
export const letterEl = writable<HTMLSpanElement>();
export const inputEl = writable<HTMLInputElement>();
export const caretEl = writable<HTMLDivElement>();