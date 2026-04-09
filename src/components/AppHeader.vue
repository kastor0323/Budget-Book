<template>
  <header class="topbar">
    <div class="topbar-left">
      <span class="topbar-brand">KB Budget Book</span>
    </div>
    <nav class="topbar-nav">
      <router-link class="topbar-btn analysis" to="/analysis"
        ><i
          class="fa-solid fa-arrow-trend-down"
          style="color: rgb(255, 255, 255)"
        ></i>
        소비 분석</router-link
      >
      <router-link class="topbar-btn profile" to="/user/me">
        <i class="fa-solid fa-person" style="color: rgb(255, 255, 255)"></i>
        마이페이지</router-link
      >
    </nav>
  </header>
</template>

<script setup>
import '../styles/appHeader.css';
</script>
