<script setup>
import { computed } from 'vue';

const props = defineProps({
  selectedDate: {
    type: String,
    default: '',
  },
  transactions: {
    type: Array,
    default: () => [],
  },
  loadError: {
    type: String,
    default: '',
  },
});

const uiText = {
  transactionList: '\uAC70\uB798 \uB0B4\uC5ED',
  noTransactionsSuffix:
    '\uC5D0 \uD45C\uC2DC\uD560 \uAC70\uB798 \uB0B4\uC5ED\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.',
};

function buildTransactionTitle(item) {
  if (item.history) return item.history;
  if (item.category) return item.category;
  return item.type === 'income'
    ? '\uC218\uC785 \uB0B4\uC5ED'
    : '\uC9C0\uCD9C \uB0B4\uC5ED';
}

function buildTransactionSubtitle(item) {
  const typeLabel = item.type === 'income' ? '\uC218\uC785' : '\uC9C0\uCD9C';
  return item.category ? `${typeLabel} \u00B7 ${item.category}` : typeLabel;
}

const emit = defineEmits(['edit', 'delete']);

function formatTransactionAmount(item) {
  const sign = item.type === 'income' ? '+' : '-';
  return `${sign}${item.amount.toLocaleString('ko-KR')}\uC6D0`;
}

const mappedTransactions = computed(() =>
  props.transactions.map((item) => ({
    ...item,
    title: buildTransactionTitle(item),
    subtitle: buildTransactionSubtitle(item),
    displayAmount: formatTransactionAmount(item),
  })),
);
</script>

<template>
  <section class="transaction-list">
    <header class="list-header">
      <h3>
        {{ `${uiText.transactionList} (${mappedTransactions.length}건)` }}
      </h3>
    </header>

    <p v-if="loadError" class="list-message list-error">{{ loadError }}</p>

    <div v-else-if="mappedTransactions.length === 0" class="list-empty">
      {{ `${selectedDate}${uiText.noTransactionsSuffix}` }}
    </div>

    <div v-else class="list-stack">
      <article
        v-for="item in mappedTransactions"
        :key="item.id"
        class="transaction-item"
      >
        <div class="transaction-icon" :class="`icon-${item.type}`">
          <span>{{ item.type === 'income' ? '+' : '↘' }}</span>
        </div>

        <div class="transaction-content">
          <strong>{{ item.title }}</strong>
          <p>{{ item.subtitle }}</p>
        </div>

        <div class="transaction-amount" :class="`amount-${item.type}`">
          {{ item.displayAmount }}
        </div>
        <div class="transaction-actions">
          <button
            type="button"
            class="action-btn edit-btn"
            @click.stop="emit('edit', item)"
          >
            수정
          </button>
          <button
            type="button"
            class="action-btn delete-btn"
            @click.stop="emit('delete', item)"
          >
            삭제
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.transaction-list {
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid #edf1f7;
  box-shadow: 0 12px 30px rgba(36, 52, 86, 0.06);
  padding: 20px 18px;
}

.list-header {
  margin-bottom: 14px;
}

.list-header h3 {
  margin: 0;
  color: #1b2741;
  font-size: 20px;
  font-weight: 800;
}

.list-message,
.list-empty {
  margin: 0;
  color: #6c7894;
  font-size: 14px;
  font-weight: 600;
}

.list-error {
  color: #df5b54;
}

.list-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-item {
  display: grid;
  grid-template-columns: 50px minmax(0, 1fr) auto auto;
  gap: 14px;
  align-items: center;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
  border: 1px solid #edf1f7;
  padding: 14px;
}

.transaction-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 18px;
  font-weight: 800;
}

.icon-income {
  background: #eef4ff;
  color: #4f67ff;
}

.icon-expense {
  background: #fff1ef;
  color: #eb5148;
}

.transaction-content {
  min-width: 0;
}

.transaction-content strong {
  display: block;
  color: #22314f;
  font-size: 17px;
  font-weight: 800;
  line-height: 1.25;
}

.transaction-content p {
  margin: 6px 0 0;
  color: #7b879f;
  font-size: 13px;
  font-weight: 600;
}

.transaction-amount {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.03em;
  white-space: nowrap;
}

.amount-income {
  color: #4f67ff;
}

.amount-expense {
  color: #eb5148;
}

.transaction-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  background: none;
  border: 1px solid #dfe6f2;
  color: #6c7894;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f1f3ff;
  color: #4f67ff;
  border-color: #96a3ff;
}

.delete-btn:hover {
  background: #fff1ef;
  color: #eb5148;
  border-color: #ffb4ab;
}

@media (max-width: 420px) {
  .transaction-list {
    padding: 16px 14px;
  }

  .list-header h3 {
    font-size: 18px;
  }

  .transaction-item {
    grid-template-columns: 42px minmax(0, 1fr) auto;
    gap: 12px;
    padding: 12px;
  }

  .transaction-icon {
    width: 42px;
    height: 42px;
    font-size: 16px;
  }

  .transaction-content strong {
    font-size: 15px;
  }

  .transaction-content p {
    font-size: 12px;
  }

  .transaction-amount {
    grid-column: 1 / -1;
    justify-self: end;
    font-size: 18px;
  }

  .transaction-actions {
    grid-column: 1 / -1;
    justify-self: end;
    margin-top: -30px;
  }
}
</style>
