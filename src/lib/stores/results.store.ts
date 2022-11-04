import { tweened } from "svelte/motion";

export const wordsPerMinute = tweened(0, { delay: 300, duration: 1000 });
export const accuracy = tweened(0, { delay: 1300, duration: 1000 });