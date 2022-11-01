<script lang="ts">
  type Game = "waiting for input" | "in progress" | "game over";
  type Word = string;

  let game: Game = "waiting for input";
  let typedLetter = "";

  let words: Word[] = "The quick brown fox jumps over the lazy dog".split(" ");
  let wordIndex = 0;
  let letterIndex = 0;
  let correctLetters = 0;

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
  };

  const setGameState = (state: Game) => {
    game = state;
  };
</script>

<div class="game" data-game={game}>
  <input
    bind:this={inputEl}
    bind:value={typedLetter}
    on:input={updateGameState}
    on:keydown={handleKeydown}
    class="input"
    type="text"
  />

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
</style>
