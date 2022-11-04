import { writable } from "svelte/store";
import type { Word } from "$lib/types/types";

export const words = writable<Word[]>([]);