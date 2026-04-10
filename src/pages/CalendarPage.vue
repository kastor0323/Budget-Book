<script setup>
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

import CalendarView from '../components/budget/CalendarView.vue';
import TransactionDetail from '../components/budget/TransactionDetail.vue';
import TransactionList from '../components/budget/TransactionList.vue';
import TransactionModal from '../components/budget/TransactionModal.vue';
import { useBudgetStore } from '../stores/budgetStore';
import AppHeader from '@/components/AppHeader.vue';

const budgetStore = useBudgetStore();
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
} = storeToRefs(budgetStore);

const isEditModalOpen = ref(false);
const editingTransaction = ref(null);

function openEditModal(transaction) {
  editingTransaction.value = transaction;
  isEditModalOpen.value = true;
}

function closeEditModal() {
  isEditModalOpen.value = false;
  editingTransaction.value = null;
}

async function handleSaveTransaction(updatedData) {
  const targetDate = updatedData.date;
  const hadSelectedDate = Boolean(selectedDate.value);
  const currentMonth = new Date(
    visibleMonth.value.getFullYear(),
    visibleMonth.value.getMonth(),
    1,
  );

  await budgetStore.updateTransaction(
    updatedData.id,
    updatedData.type,
    updatedData,
  );

  if (hadSelectedDate) {
    budgetStore.focusDate(targetDate);
  } else {
    budgetStore.focusMonth(currentMonth);
  }

  closeEditModal();
}

async function handleDeleteTransaction(transaction) {
  if (
    confirm(
      '\uC815\uB9D0\uB85C \uC774 \uAC70\uB798 \uB0B4\uC5ED\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
    )
  ) {
    const hadSelectedDate = Boolean(selectedDate.value);
    const currentMonth = new Date(
      visibleMonth.value.getFullYear(),
      visibleMonth.value.getMonth(),
      1,
    );
    await budgetStore.deleteTransaction(transaction.id, transaction.type);

    if (hadSelectedDate) {
      budgetStore.focusDate(transaction.date);
    } else {
      budgetStore.focusMonth(currentMonth);
    }
  }
}

onMounted(() => {
  budgetStore.loadLedgerEntries();
});
</script>

<template>
  <AppHeader></AppHeader>
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

      <section class="transaction-section">
        <TransactionDetail
          :selected-date="selectedDate"
          :visible-month="visibleMonth"
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
          @edit="openEditModal"
          @delete="handleDeleteTransaction"
        />
      </section>

      <TransactionModal
        :show="isEditModalOpen"
        :transaction="editingTransaction"
        @close="closeEditModal"
        @save="handleSaveTransaction"
      />
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
