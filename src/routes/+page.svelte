<script lang="ts">
  import { onMount } from "svelte";

  import { blur } from "svelte/transition";
  import type { Game, Word } from "$lib/types/types";
  import {
    timer,
    game,
    words,
    wordIndex,
    letterIndex,
    correctLetters,
    typedLetter,
    toggleReset,
    wordsEl,
    letterEl,
    inputEl,
    caretEl,
    wordsPerMinute,
    accuracy
  } from "$lib/stores";

  const updateGameState = () => {
    setLetter();
    checkLetter();
    nextLetter();
    resetLetter();
    updateLine();
    moveCaret();
  };

  const setLetter = () => {
    const isWordCompleted: boolean =
      $letterIndex > $words[$wordIndex].length - 1;

    if (!isWordCompleted) {
      $letterEl = $wordsEl.children[$wordIndex].children[
        $letterIndex
      ] as HTMLSpanElement;
    }
  };

  const checkLetter = () => {
    const currentLetter: string = $words[$wordIndex][$letterIndex];

    if ($typedLetter === currentLetter) {
      $letterEl.dataset.letter = "correct";
      increaseScore();
    }

    if ($typedLetter !== currentLetter) {
      $letterEl.dataset.letter = "incorrect";
    }
  };

  const increaseScore = () => {
    $correctLetters += 1;
  };

  const nextLetter = () => {
    $letterIndex += 1;
  };

  const resetLetter = () => {
    $typedLetter = "";
  };

  const nextWord = () => {
    const isNotFirstLetter: boolean = $letterIndex !== 0;
    const isOneLetterWord: boolean = $words[$wordIndex].length === 1;

    if (isNotFirstLetter || isOneLetterWord) {
      $wordIndex += 1;
      $letterIndex = 0;
      increaseScore();
      moveCaret();
    }
  };

  const updateLine = () => {
    const wordEl = $wordsEl.children[$wordIndex];
    const wordsY = $wordsEl.getBoundingClientRect().y;
    const wordY = wordEl.getBoundingClientRect().y;

    if (wordY > wordsY) {
      wordEl.scrollIntoView({ block: "center" });
    }
  };

  const moveCaret = () => {
    const offset = 4;
    $caretEl.style.top = `${$letterEl.offsetTop + offset}px`;
    $caretEl.style.left = `${$letterEl.offsetLeft + $letterEl.offsetWidth}px`;
  };

  const getResults = () => {
    $wordsPerMinute = getWordsPerMinute();
    $accuracy = getAccuracy();
  };

  const getWordsPerMinute = () => {
    const word = 5;
    const minutes = 0.5;
    return Math.floor($correctLetters / word / minutes);
  };

  const getAccuracy = () => {
    const totalLetters = getTotalLetters($words);
    return Math.floor(($correctLetters / totalLetters) * 100);
  };

  const getTotalLetters = (words: Word[]) => {
    return words.reduce((count, word) => count + word.length, 0);
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.code === "Space") {
      event.preventDefault();

      if ($game === "in progress") {
        nextWord();
      }
    }

    if ($game === "waiting for input") {
      startGame();
    }
  };

  const startGame = () => {
    setGameState("in progress");
    setGameTimer();
  };

  const setGameTimer = () => {
    const gameTimer = () => {
      if ($timer > 0) {
        $timer -= 1;
      }

      if ($game === "waiting for input" || $timer === 0) {
        clearInterval(interval);
      }

      if ($timer === 0) {
        setGameState("game over");
        getResults();
      }
    };

    const interval = setInterval(gameTimer, 1000);
  };

  const setGameState = (state: Game) => {
    $game = state;
  };

  const resetGame = () => {
    $toggleReset = !$toggleReset;

    setGameState("waiting for input");
    getWords(100);

    $timer = 30;
    $typedLetter = "";
    $wordIndex = 0;
    $letterIndex = 0;
    $correctLetters = 0;

    $wordsPerMinute = 0;
    $accuracy = 0;
  };

  const getWords = async (limit: number) => {
    const response = await fetch(`/api/words?limit=${limit}`);
    $words = await response.json();
  };

  const focusInput = () => {
    $inputEl.focus();
  };

  onMount(() => {
    getWords(100);
    focusInput();
  });
</script>

{#if $game !== "game over"}
  <div class="game" data-game={$game}>
    <input
      bind:this={$inputEl}
      bind:value={$typedLetter}
      on:input={updateGameState}
      on:keydown={handleKeydown}
      class="input"
      type="text"
    />

    <div class="time">{$timer}</div>

    {#key $toggleReset}
      <div in:blur|local bind:this={$wordsEl} class="words">
        {#each $words as word}
          <span class="word">
            {#each word as letter}
              <span class="letter">{letter}</span>
            {/each}
          </span>
        {/each}

        <div bind:this={$caretEl} class="caret" />
      </div>
    {/key}

    <div class="reset">
      <button on:click={resetGame} aria-label="reset">
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          stroke-width="1.5"
          stroke="currentColor"
          fill="none"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"
          />
        </svg>
      </button>
    </div>
  </div>
{/if}

{#if $game === "game over"}
  <div in:blur class="results">
    <div>
      <p class="title">wpm</p>
      <p class="score">{Math.trunc($wordsPerMinute)}</p>
    </div>

    <div>
      <p class="title">accuracy</p>
      <p class="score">{Math.trunc($accuracy)}%</p>
    </div>

    <button on:click={resetGame} class="play">play again</button>
  </div>
{/if}

<style lang="scss">
  .game {
    position: relative;

    .input {
      position: absolute;
      opacity: 0;
    }

    .time {
      position: absolute;
      top: -48px;
      color: var(--primary);
      font-size: 2.4rem;
      opacity: 0;
      transition: all 0.3s ease;
    }

    &[data-game="in progress"] .time {
      opacity: 1;
    }

    &[data-game="in progress"] .caret {
      animation: none;
    }

    .reset {
      margin-top: 3.2rem;
      display: grid;
      justify-content: center;
      width: 100%;
    }
  }

  .words {
    --line-height: 1em;
    --lines: 3;

    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 0.6em;
    width: 100%;
    max-height: calc(var(--line-height) * var(--lines) * 1.42);
    overflow: hidden;
    font-size: 2.4rem;
    line-height: var(--line-height);
    user-select: none;

    .letter {
      opacity: 0.4;
      transition: all 0.3s ease;

      &:global([data-letter="correct"]) {
        opacity: 0.8;
      }

      &:global([data-letter="incorrect"]) {
        color: var(--primary);
        opacity: 1;
      }
    }

    .caret {
      position: absolute;
      top: 0;
      height: 2.88rem;
      border-right: 1px solid var(--primary);
      animation: caret 1s infinite;
      transition: all 0.2s ease;

      @keyframes caret {
        0%,
        to {
          opacity: 0;
        }
        50% {
          opacity: 1;
        }
      }
    }
  }

  .results {
    .title {
      color: var(--fg-200);
      font-size: 3.2rem;
    }

    .score {
      color: var(--primary);
      font-size: 6.4rem;
    }

    .play {
      margin-top: 1.6rem;
      font-size: 1.6rem;
    }
  }
</style>
