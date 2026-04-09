<script setup>
import CalendarView from '../components/budget/CalendarView.vue'
import TransactionDetail from '../components/budget/TransactionDetail.vue'
import TransactionList from '../components/budget/TransactionList.vue'
</script>

<template>
  <section class="calendar-page">
    <div class="page-body">
      <CalendarView />

      <section class="transaction-section">
        <TransactionDetail />
        <TransactionList />
      </section>
    </div>
  </section>
</template>

<style scoped>
.calendar-page {
  min-height: 100vh;
  padding: 32px 0 40px;
}

.page-body {
  width: 100%;
  max-width: 980px;
  min-width: 360px;
  margin: 0 auto;
}

.transaction-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
}

@media (min-width: 768px) {
  .transaction-section {
    gap: 20px;
    margin-top: 24px;
  }
}
</style>
