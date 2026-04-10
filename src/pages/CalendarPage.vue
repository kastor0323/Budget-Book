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

async function handleCreateTransaction(formData) {
  await budgetStore.addTransaction(formData);
  closeCreateModal();
}

async function handleDeleteTransaction(transaction) {
  const hadSelectedDate = Boolean(selectedDate.value);
  const currentMonth = new Date(
    visibleMonth.value.getFullYear(),
    visibleMonth.value.getMonth(),
    1,
  );

  if (confirm('정말로 이 거래 내역을 삭제하시겠습니까?')) {
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
  <AppHeader />

  <section class="calendar-page">
    <div class="page-body">
      <section class="top-layout">
        <div class="calendar-column">
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
        </div>

        <div class="summary-column">
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
        </div>
      </section>

      <section class="list-section">
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
  padding: 32px 16px 40px;
}

.page-body {
  width: 100%;
  max-width: 1400px;
  min-width: 360px;
  margin: 0 auto;
}

.top-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(320px, 0.9fr);
  gap: 24px;
  align-items: start;
}

.calendar-column,
.summary-column {
  min-width: 0;
}

.list-section {
  width: 100%;
  max-width: 980px;
  margin: 24px auto 0;
}

@media (max-width: 1024px) {
  .top-layout {
    grid-template-columns: 1fr;
  }

  .list-section {
    margin-top: 20px;
  }
}

@media (max-width: 768px) {
  .calendar-page {
    padding: 24px 12px 32px;
  }

  .top-layout {
    gap: 18px;
  }

  .list-section {
    margin-top: 18px;
  }
}
</style>
