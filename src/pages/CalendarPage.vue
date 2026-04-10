<script setup>
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

import CalendarView from '../components/budget/CalendarView.vue';
import TransactionDetail from '../components/budget/TransactionDetail.vue';
import TransactionList from '../components/budget/TransactionList.vue';
import TransactionModal from '../components/budget/TransactionModal.vue';
import TransactionForm from '../components/budget/TransactionForm.vue';
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

const isCreateModalOpen = ref(false);

function openEditModal(transaction) {
  editingTransaction.value = transaction;
  isEditModalOpen.value = true;
}

function closeEditModal() {
  isEditModalOpen.value = false;
  editingTransaction.value = null;
}

function openCreateModal() {
  if (!selectedDate.value) {
    alert('캘린더에서 날짜를 먼저 선택해주세요.');
    return;
  }
  isCreateModalOpen.value = true;
}

function closeCreateModal() {
  isCreateModalOpen.value = false;
}

async function handleSaveTransaction(updatedData) {
  await budgetStore.updateTransaction(
    updatedData.id,
    updatedData.type,
    updatedData,
  );
  closeEditModal();
}

async function handleCreateTransaction(formData) {
  await budgetStore.addTransaction(formData);
  closeCreateModal();
}

async function handleDeleteTransaction(transaction) {
  if (confirm('정말로 이 거래 내역을 삭제하시겠습니까?')) {
    await budgetStore.deleteTransaction(transaction.id, transaction.type);
  }
}

onMounted(() => {
  budgetStore.loadLedgerEntries();
});
</script>

<template>
  <AppHeader />

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
        @open-create="openCreateModal"
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

      <TransactionForm
        :show="isCreateModalOpen"
        :selected-date="selectedDate"
        :category-groups="categoryGroups"
        @close="closeCreateModal"
        @save="handleCreateTransaction"
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
