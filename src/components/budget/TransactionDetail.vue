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
  filters: {
    type: Object,
    required: true,
  },
  categoryOptions: {
    type: Array,
    default: () => [],
  },
  categoryGroups: {
    type: Object,
    default: () => ({
      income: [],
      expense: [],
    }),
  },
  loadError: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['filter-change']);

const uiText = {
  dailySummaryTitle: '\uC77C\uC77C \uC694\uC57D',
  transactionType: '\uAC70\uB798 \uC720\uD615',
  category: '\uCE74\uD14C\uACE0\uB9AC',
  sortBy: '\uC815\uB82C \uAE30\uC900',
  all: '\uC804\uCCB4',
  income: '\uC218\uC785',
  expense: '\uC9C0\uCD9C',
  amountDesc: '\uAE08\uC561 \uB0B4\uB9BC\uCC28\uC21C',
  amountAsc: '\uAE08\uC561 \uC624\uB984\uCC28\uC21C',
};

function formatDateLabel(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return `${year}\uB144 ${month}\uC6D4 ${day}\uC77C`;
}

function formatSummaryAmount(amount) {
  const sign = amount > 0 ? '+' : amount < 0 ? '-' : '';
  return `${sign}${Math.abs(amount).toLocaleString('ko-KR')}\uC6D0`;
}

const dailySummary = computed(() => {
  const income = props.transactions
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);

  const expense = props.transactions
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = income - expense;

  return [
    {
      label: '\uC218\uC785',
      amount: formatSummaryAmount(income),
      tone: 'income',
    },
    {
      label: '\uC9C0\uCD9C',
      amount: formatSummaryAmount(-expense),
      tone: 'expense',
    },
    {
      label: '\uD569\uACC4',
      amount: formatSummaryAmount(balance),
      tone: 'balance',
    },
  ];
});

function updateFilter(key, event) {
  emit('filter-change', {
    [key]: event.target.value,
  });
}
</script>

<template>
  <section class="transaction-detail">
    <header class="detail-header">
      <h2>{{ formatDateLabel(selectedDate) }}</h2>
    </header>

    <div class="detail-card">
      <h3>{{ uiText.dailySummaryTitle }}</h3>

      <div class="summary-grid">
        <article
          v-for="item in dailySummary"
          :key="item.label"
          class="summary-item"
          :class="`summary-${item.tone}`"
        >
          <span>{{ item.label }}</span>
          <strong>{{ item.amount }}</strong>
        </article>
      </div>
    </div>

    <div class="detail-card filter-card">
      <div class="filter-group">
        <label for="transaction-type">{{ uiText.transactionType }}</label>
        <select
          id="transaction-type"
          :value="filters.type"
          @change="updateFilter('type', $event)"
        >
          <option value="all">{{ uiText.all }}</option>
          <option value="income">{{ uiText.income }}</option>
          <option value="expense">{{ uiText.expense }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="transaction-category">{{ uiText.category }}</label>
        <select
          id="transaction-category"
          :value="filters.category"
          @change="updateFilter('category', $event)"
        >
          <option value="all">{{ uiText.all }}</option>
          <template v-if="filters.type === 'all'">
            <optgroup :label="uiText.income">
              <option
                v-for="category in categoryGroups.income"
                :key="`income-${category}`"
                :value="category"
              >
                {{ category }}
              </option>
            </optgroup>
            <optgroup :label="uiText.expense">
              <option
                v-for="category in categoryGroups.expense"
                :key="`expense-${category}`"
                :value="category"
              >
                {{ category }}
              </option>
            </optgroup>
          </template>
          <template v-else>
            <option
              v-for="category in categoryOptions"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </template>
        </select>
      </div>

      <div class="filter-group">
        <label>{{ uiText.sortBy }}</label>
        <div class="sort-buttons">
          <button
            type="button"
            class="sort-button"
            :class="{ active: filters.sort === 'amount-desc' }"
            @click="$emit('filter-change', { sort: 'amount-desc' })"
          >
            {{ uiText.amountDesc }}
          </button>
          <button
            type="button"
            class="sort-button"
            :class="{ active: filters.sort === 'amount-asc' }"
            @click="$emit('filter-change', { sort: 'amount-asc' })"
          >
            {{ uiText.amountAsc }}
          </button>
        </div>
      </div>
    </div>

    <p v-if="loadError" class="detail-message detail-error">{{ loadError }}</p>
  </section>
</template>

<style scoped>
.transaction-detail {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail-header h2 {
  margin: 0;
  color: #1b2741;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.detail-card {
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid #edf1f7;
  box-shadow: 0 12px 30px rgba(36, 52, 86, 0.06);
  padding: 20px 18px;
}

.detail-card h3 {
  margin: 0 0 14px;
  color: #1b2741;
  font-size: 20px;
  font-weight: 800;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.summary-item {
  min-height: 104px;
  border-radius: 18px;
  padding: 16px 10px;
  text-align: center;
}

.summary-item span {
  display: block;
  margin-bottom: 10px;
  color: #7e879d;
  font-size: 13px;
  font-weight: 700;
}

.summary-item strong {
  display: block;
  font-size: 20px;
  line-height: 1.25;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.summary-income {
  background: #f1f6ff;
}

.summary-income strong {
  color: #4f67ff;
}

.summary-expense {
  background: #fff2f1;
}

.summary-expense strong {
  color: #eb5148;
}

.summary-balance {
  background: #f1fbf3;
}

.summary-balance strong {
  color: #43a864;
}

.filter-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  color: #44506a;
  font-size: 14px;
  font-weight: 700;
}

.filter-group select {
  width: 100%;
  height: 48px;
  border-radius: 14px;
  border: 1px solid #dfe6f2;
  background: #ffffff;
  color: #243250;
  font-size: 15px;
  font-weight: 600;
  padding: 0 14px;
  outline: none;
}

.filter-group select:focus {
  border-color: #96a3ff;
  box-shadow: 0 0 0 4px rgba(104, 118, 255, 0.12);
}

.sort-buttons {
  display: flex;
  gap: 10px;
}

.sort-button {
  flex: 1;
  height: 48px;
  border-radius: 14px;
  border: 1px solid #dfe6f2;
  background: #ffffff;
  color: #6c7894;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sort-button:hover {
  background: #f8f9fc;
}

.sort-button.active {
  border-color: #6876ff;
  background: #f1f3ff;
  color: #4f67ff;
}

.detail-message {
  margin: 0;
  color: #6c7894;
  font-size: 14px;
  font-weight: 600;
}

.detail-error {
  color: #df5b54;
}

@media (max-width: 420px) {
  .detail-header h2 {
    font-size: 24px;
  }

  .detail-card {
    padding: 16px 14px;
  }

  .detail-card h3 {
    font-size: 18px;
  }

  .summary-grid {
    gap: 8px;
  }

  .summary-item {
    min-height: 92px;
    padding: 14px 8px;
  }

  .summary-item span {
    font-size: 12px;
  }

  .summary-item strong {
    font-size: 16px;
  }
}
</style>
