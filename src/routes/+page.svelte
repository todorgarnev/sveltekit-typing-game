<script lang="ts">
  import { tweened } from "svelte/motion";

  type Game = "waiting for input" | "in progress" | "game over";
  type Word = string;

  let game: Game = "waiting for input";
  let seconds: number = 30;
  let typedLetter: string = "";

  let words: Word[] = "The quick brown fox jumps over the lazy dog".split(" ");
  let wordIndex: number = 0;
  let letterIndex: number = 0;
  let correctLetters: number = 0;

  let wordsPerMinute = tweened(0, { delay: 300, duration: 1000 });
  let accuracy = tweened(0, { delay: 1300, duration: 1000 });

  let wordsEl: HTMLDivElement;
  let letterEl: HTMLSpanElement;
  let inputEl: HTMLInputElement;
  let caretEl: HTMLDivElement;

  const updateGameState = () => {
    setLetter();
    checkLetter();
    nextLetter();
    resetLetter();
    updateLine();
    moveCaret();
  };

  const setLetter = () => {
    const isWordCompleted: boolean = letterIndex > words[wordIndex].length - 1;

    if (!isWordCompleted) {
      letterEl = wordsEl.children[wordIndex].children[
        letterIndex
      ] as HTMLSpanElement;
    }
  };

  const checkLetter = () => {
    const currentLetter: string = words[wordIndex][letterIndex];

    if (typedLetter === currentLetter) {
      letterEl.dataset.letter = "correct";
      increaseScore();
    }

    if (typedLetter !== currentLetter) {
      letterEl.dataset.letter = "incorrect";
    }
  };

  const increaseScore = () => {
    correctLetters += 1;
  };

  const nextLetter = () => {
    letterIndex += 1;
  };

  const resetLetter = () => {
    typedLetter = "";
  };

  const nextWord = () => {
    const isNotFirstLetter: boolean = letterIndex !== 0;
    const isOneLetterWord: boolean = words[wordIndex].length === 1;

    if (isNotFirstLetter || isOneLetterWord) {
      wordIndex += 1;
      letterIndex = 0;
      increaseScore();
      moveCaret();
    }
  };

  const updateLine = () => {
    const wordEl = wordsEl.children[wordIndex];
    const wordsY = wordsEl.getBoundingClientRect().y;
    const wordY = wordEl.getBoundingClientRect().y;

    if (wordY > wordsY) {
      wordEl.scrollIntoView({ block: "center" });
    }
  };

  const moveCaret = () => {
    const offset = 4;
    caretEl.style.top = `${letterEl.offsetTop + offset}px`;
    caretEl.style.left = `${letterEl.offsetLeft + letterEl.offsetWidth}px`;
  };

  const getResults = () => {
    $wordsPerMinute = getWordsPerMinute();
    $accuracy = getAccuracy();
  };

  const getWordsPerMinute = () => {
    const word = 5;
    const minutes = 0.5;
    return Math.floor(correctLetters / word / minutes);
  };

  const getAccuracy = () => {
    const totalLetters = getTotalLetters(words);
    return Math.floor((correctLetters / totalLetters) * 100);
  };

  const getTotalLetters = (words: Word[]) => {
    return words.reduce((count, word) => count + word.length, 0);
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.code === "Space") {
      event.preventDefault();

      if (game === "in progress") {
        nextWord();
      }
    }

    if (game === "waiting for input") {
      startGame();
    }
  };

  const startGame = () => {
    setGameState("in progress");
    setGameTimer();
  };

  const setGameTimer = () => {
    const gameTimer = () => {
      if (seconds > 0) {
        seconds -= 1;
      }

      if (game === "waiting for input" || seconds === 0) {
        clearInterval(interval);
      }

      if (seconds === 0) {
        setGameState("game over");
        getResults();
      }
    };

    const interval = setInterval(gameTimer, 1000);
  };

  const setGameState = (state: Game) => {
    game = state;
  };
</script>

{#if game !== "game over"}
  <div class="game" data-game={game}>
    <input
      bind:this={inputEl}
      bind:value={typedLetter}
      on:input={updateGameState}
      on:keydown={handleKeydown}
      class="input"
      type="text"
    />

    <div class="time">{seconds}</div>

    <div bind:this={wordsEl} class="words">
      {#each words as word}
        <span class="word">
          {#each word as letter}
            <span class="letter">{letter}</span>
          {/each}
        </span>
      {/each}

      <div bind:this={caretEl} class="caret" />
    </div>
  </div>
{/if}

{#if game === "game over"}
  <div class="results">
    <div>
      <p class="title">wpm</p>
      <p class="score">{Math.trunc($wordsPerMinute)}</p>
    </div>

    <div>
      <p class="title">accuracy</p>
      <p class="score">{Math.trunc($accuracy)}%</p>
    </div>
  </div>
{/if}

<style lang="scss">
  .words {
    --line-height: 1em;
    --lines: 3;

    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 0.6em;
    width: 100%;
    max-height: calc(var(--line-height) * var(--lines) * 1.42);
    font-size: 1.5rem;
    line-height: var(--line-height);
    overflow: hidden;
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

    .game {
      position: relative;

      .time {
        position: absolute;
        top: -48px;
        font-size: 1.5rem;
        color: var(--primary);
        opacity: 0;
        transition: all 0.3s ease;
      }

      &[data-game="in progress"] .time {
        opacity: 1;
      }

      &[data-game="in progress"] .caret {
        animation: none;
      }
    }

    .caret {
      position: absolute;
      height: 1.8rem;
      top: 0;
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
      font-size: 2rem;
      color: var(--fg-200);
    }

    .score {
      font-size: 4rem;
      color: var(--primary);
    }

    .play {
      margin-top: 1rem;
    }
  }
</style>
