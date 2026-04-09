<script setup>
import { RouterView } from 'vue-router';
</script>

<template>
  <main class="app-container">
    <RouterView />
  </main>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body,
#app {
  width: 100%;
  min-height: 100%;
}

body {
  font-family: sans-serif;
  background: #f9fafb;
  color: #111827;
}
</style>
