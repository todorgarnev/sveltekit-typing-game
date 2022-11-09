<script lang="ts">
  import { onMount } from "svelte";
  import { blur } from "svelte/transition";
  import {
    timer,
    game,
    words,
    typedLetter,
    toggleReset,
    wordsEl,
    inputEl,
    caretEl,
    wordsPerMinute,
    accuracy,
  } from "$lib/stores";
  import {
    handleKeydown,
    resetGame,
    getWords,
    focusInput,
    updateGameState
  } from "$lib/utils";

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
