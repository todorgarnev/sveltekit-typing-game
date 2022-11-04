<script lang="ts">
  import "../styles/app.scss";
</script>

<svelte:head>
  <title>Sveltype</title>
</svelte:head>

<div class="layout">
  <h1>✏️ sveltype ⌛</h1>

  <main>
    <slot />
  </main>
</div>

<style lang="scss">
  h1 {
    font-family: "Lexend Deca", sans-serif;
    font-size: 2.8rem;
    color: var(--fg-200);
    letter-spacing: 2px;
  }

  .layout {
    padding: 3.2rem;
    display: grid;
    grid-template-rows: auto 1fr;
    align-items: center;
    height: 100%;
  }
</style>
