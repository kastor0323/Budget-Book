<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import CalendarView from '../components/budget/CalendarView.vue'
import TransactionDetail from '../components/budget/TransactionDetail.vue'
import TransactionList from '../components/budget/TransactionList.vue'
import { useBudgetStore } from '../stores/budgetStore'

const budgetStore = useBudgetStore()
const {
  selectedDate,
  visibleMonth,
  isLoading,
  loadError,
  filters,
  ledgerEntries,
  categoryOptions,
  categoryGroups,
  selectedSummaryTransactions,
  summarySourceTransactions,
} = storeToRefs(budgetStore)

onMounted(() => {
  budgetStore.loadLedgerEntries()
})
</script>

<template>
  <section class="calendar-page">
    <div class="page-body">
      <CalendarView
        :ledger-entries="ledgerEntries"
        :visible-month="visibleMonth"
        :selected-date="selectedDate"
        :is-loading="isLoading"
        :load-error="loadError"
        @month-change="budgetStore.changeMonth"
        @date-select="budgetStore.toggleSelectedDate"
      />

      <section v-if="selectedDate" class="transaction-section">
        <TransactionDetail
          :selected-date="selectedDate"
          :transactions="summarySourceTransactions"
          :filters="filters"
          :category-options="categoryOptions"
          :category-groups="categoryGroups"
          :load-error="loadError"
          @filter-change="budgetStore.updateFilters"
        />
        <TransactionList
          :selected-date="selectedDate"
          :transactions="selectedSummaryTransactions"
          :load-error="loadError"
        />
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
