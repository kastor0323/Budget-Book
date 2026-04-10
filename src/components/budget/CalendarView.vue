<script setup>
import { computed } from 'vue';

const props = defineProps({
  ledgerEntries: {
    type: Array,
    default: () => [],
  },
  visibleMonth: {
    type: Date,
    required: true,
  },
  selectedDate: {
    type: String,
    default: '',
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  loadError: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['month-change', 'date-select', 'open-create']);

const weekdayLabels = [
  { label: '\uC77C', tone: 'sun' },
  { label: '\uC6D4', tone: 'default' },
  { label: '\uD654', tone: 'default' },
  { label: '\uC218', tone: 'default' },
  { label: '\uBAA9', tone: 'default' },
  { label: '\uAE08', tone: 'default' },
  { label: '\uD1A0', tone: 'sat' },
];

const today = new Date();
const todayKey = createDateKey(
  today.getFullYear(),
  today.getMonth() + 1,
  today.getDate(),
);

function parseLedgerDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return { year, month, day };
}

function createDateKey(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatSignedAmount(amount, sign) {
  if (!amount) return '';
  return `${sign}${amount.toLocaleString('ko-KR')}`;
}

function formatSummaryAmount(amount) {
  const sign = amount > 0 ? '+' : amount < 0 ? '-' : '';
  return `${sign}${Math.abs(amount).toLocaleString('ko-KR')}\uC6D0`;
}

const currentYear = computed(() => props.visibleMonth.getFullYear());
const currentMonthIndex = computed(() => props.visibleMonth.getMonth());
const currentMonthNumber = computed(() => currentMonthIndex.value + 1);

const currentMonthLabel = computed(
  () => `${currentYear.value}\uB144 ${currentMonthNumber.value}\uC6D4`,
);

const monthlyCalendarResponse = computed(() => {
  const dailySummaryMap = new Map();

  props.ledgerEntries.forEach((entry) => {
    const { year, month, day } = parseLedgerDate(entry.date);

    if (year !== currentYear.value || month !== currentMonthNumber.value) {
      return;
    }

    const dateKey = createDateKey(year, month, day);
    const existing = dailySummaryMap.get(dateKey) ?? {
      date: dateKey,
      totalIncome: 0,
      totalExpense: 0,
    };

    if (entry.type === 'income') {
      existing.totalIncome += entry.amount;
    } else {
      existing.totalExpense += entry.amount;
    }

    dailySummaryMap.set(dateKey, existing);
  });

  return [...dailySummaryMap.values()].sort((left, right) =>
    left.date.localeCompare(right.date),
  );
});

const monthlySummaryMap = computed(() =>
  monthlyCalendarResponse.value.reduce((accumulator, item) => {
    accumulator[item.date] = item;
    return accumulator;
  }, {}),
);

const calendarCells = computed(() => {
  const firstWeekday = new Date(
    currentYear.value,
    currentMonthIndex.value,
    1,
  ).getDay();
  const lastDateOfMonth = new Date(
    currentYear.value,
    currentMonthIndex.value + 1,
    0,
  ).getDate();

  const leadingEmptyCells = Array.from(
    { length: firstWeekday },
    (_, index) => ({
      key: `empty-${index}`,
      isEmpty: true,
    }),
  );

  const datedCells = Array.from({ length: lastDateOfMonth }, (_, index) => {
    const day = index + 1;
    const dateKey = createDateKey(
      currentYear.value,
      currentMonthNumber.value,
      day,
    );
    const summary = monthlySummaryMap.value[dateKey];

    return {
      key: dateKey,
      isEmpty: false,
      day,
      dateKey,
      income: formatSignedAmount(summary?.totalIncome ?? 0, '+'),
      expense: formatSignedAmount(summary?.totalExpense ?? 0, '-'),
      isToday: dateKey === todayKey,
    };
  });

  return [...leadingEmptyCells, ...datedCells];
});

const summaryCards = computed(() => {
  const monthlyIncome = monthlyCalendarResponse.value.reduce(
    (sum, item) => sum + item.totalIncome,
    0,
  );
  const monthlyExpense = monthlyCalendarResponse.value.reduce(
    (sum, item) => sum + item.totalExpense,
    0,
  );
  const balance = monthlyIncome - monthlyExpense;

  return [
    {
      label: '\uC218\uC785',
      amount: formatSummaryAmount(monthlyIncome),
      tone: 'income',
    },
    {
      label: '\uC9C0\uCD9C',
      amount: formatSummaryAmount(-monthlyExpense),
      tone: 'expense',
    },
    {
      label: '\uC794\uC561',
      amount: formatSummaryAmount(balance),
      tone: 'balance',
    },
  ];
});

function isSelectedDate(dateKey) {
  return props.selectedDate === dateKey;
}
</script>

<template>
  <section class="calendar-view d-flex flex-column gap-3">
    <article class="calendar-panel">
      <div
        class="calendar-heading d-flex align-items-center justify-content-between"
      >
        <button
          type="button"
          class="month-arrow btn btn-link p-0 text-decoration-none"
          aria-label="Previous month"
          @click="emit('month-change', -1)"
        >
          &lsaquo;
        </button>
        <h1>{{ currentMonthLabel }}</h1>
        <button
          type="button"
          class="month-arrow btn btn-link p-0 text-decoration-none"
          aria-label="Next month"
          @click="emit('month-change', 1)"
        >
          &rsaquo;
        </button>
      </div>

      <div v-if="loadError" class="calendar-status calendar-status-error">
        {{ loadError }}
      </div>

      <div v-else-if="isLoading" class="calendar-status">
        \uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC624\uB294
        \uC911\uC785\uB2C8\uB2E4.
      </div>

      <template v-else>
        <div class="weekday-row">
          <span
            v-for="weekday in weekdayLabels"
            :key="weekday.label"
            class="weekday-label"
            :class="`weekday-${weekday.tone}`"
          >
            {{ weekday.label }}
          </span>
        </div>

        <div class="calendar-grid">
          <button
            v-for="cell in calendarCells"
            :key="cell.key"
            type="button"
            class="date-cell"
            :class="{
              'date-cell-empty': cell.isEmpty,
              'date-cell-clickable': !cell.isEmpty,
              'date-cell-selected':
                !cell.isEmpty && isSelectedDate(cell.dateKey),
            }"
            :disabled="cell.isEmpty"
            @click="!cell.isEmpty && emit('date-select', cell.dateKey)"
          >
            <template v-if="!cell.isEmpty">
              <span class="day-number-row">
                <span class="day-number">{{ cell.day }}</span>
                <span v-if="cell.isToday" class="today-badge">TODAY</span>
              </span>
              <span v-if="cell.expense" class="day-amount day-expense">
                {{ cell.expense }}
              </span>
              <span v-if="cell.income" class="day-amount day-income">
                {{ cell.income }}
              </span>
            </template>
          </button>
        </div>

        <button
          type="button"
          class="create-button"
          aria-label="거래 추가"
          @click="emit('open-create')"
        >
          +
        </button>
      </template>
    </article>
  </section>
</template>

<style scoped>
.calendar-view {
  min-width: 0;
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
}

.calendar-panel,
.summary-panel {
  position: relative;
  border-radius: 24px;
  background: #fff;
  border: 1px solid #edf1f7;
  box-shadow: 0 12px 30px rgba(36, 52, 86, 0.06);
}

.calendar-panel {
  padding: 24px 20px 54px;
}

.calendar-heading {
  margin-bottom: 18px;
}

.calendar-heading h1 {
  color: #1b2741;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.month-arrow {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #2a324b;
  font-size: 30px;
  line-height: 1;
  cursor: pointer;
}

.calendar-status {
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c7894;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
}

.calendar-status-error {
  color: #df5b54;
}

.weekday-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 14px;
}

.weekday-label {
  text-align: center;
  color: #63708e;
  font-size: 14px;
  font-weight: 700;
}

.weekday-sun {
  color: #ef5d50;
}

.weekday-sat {
  color: #5a68ff;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 10px 8px;
}

.date-cell {
  min-height: 88px;
  border-radius: 14px;
  padding: 10px 4px 8px;
  text-align: center;
  border: 1px solid #edf1f7;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
}

.date-cell-empty {
  border-color: transparent;
  background: transparent;
  box-shadow: none;
  pointer-events: none;
}

.date-cell-clickable {
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.date-cell-clickable:hover {
  background: linear-gradient(180deg, #f8faff 0%, #f1f5ff 100%);
  border-color: #d9e1ff;
  box-shadow: 0 10px 20px rgba(99, 116, 255, 0.08);
  transform: translateY(-2px);
  z-index: 1;
}

.date-cell-selected {
  border-color: #5c6eff !important;
  background: #f4f6ff !important;
  box-shadow:
    0 0 0 2px rgba(92, 110, 255, 0.4),
    0 12px 24px rgba(92, 110, 255, 0.2) !important;
  transform: scale(1.05) !important;
  z-index: 10;
  position: relative;
  animation: calendarPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes calendarPop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1.05);
  }
}

.day-number-row {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 4px;
}

.day-number {
  display: block;
  color: #7e879d;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.1;
}

.today-badge {
  padding: 3px 6px;
  border-radius: 999px;
  background: #eef3ff;
  color: #5c6eff;
  font-size: 9px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.04em;
}

.day-amount {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.03em;
}

.day-expense {
  color: #ee5b5b;
}

.day-income {
  color: #5c6eff;
}

.summary-panel {
  padding: 16px 16px 18px;
}

.summary-title-row {
  margin-bottom: 14px;
}

.summary-title-row h2 {
  color: #1b2741;
  font-size: 18px;
  font-weight: 800;
}

.summary-grid {
  margin: 0;
}

.summary-card {
  min-height: 116px;
  border-radius: 18px;
  padding: 18px 12px;
  text-align: center;
}

.summary-card p {
  margin-bottom: 8px;
  color: #7e879d;
  font-size: 13px;
  font-weight: 700;
}

.summary-card strong {
  display: block;
  font-size: 21px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.04em;
}

.create-button {
  position: absolute;
  right: 18px;
  bottom: 18px;
  width: 58px;
  height: 58px;
  border: 0;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    rgba(255, 210, 66, 0.84) 0%,
    rgba(255, 178, 38, 0.84) 100%
  );
  color: #ffffff;
  font-size: 34px;
  line-height: 1;
  box-shadow: 0 18px 28px rgba(255, 184, 46, 0.28);
  backdrop-filter: blur(8px);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.create-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 22px 32px rgba(255, 184, 46, 0.34);
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

@media (max-width: 420px) {
  .calendar-panel {
    padding: 18px 14px 48px;
  }

  .calendar-heading {
    margin-bottom: 14px;
  }

  .calendar-heading h1,
  .summary-title-row h2 {
    font-size: 17px;
  }

  .weekday-label {
    font-size: 13px;
  }

  .calendar-grid {
    gap: 6px 4px;
  }

  .date-cell {
    min-height: 56px;
    padding: 6px 2px;
  }

  .day-number {
    font-size: 13px;
  }

  .day-number-row {
    gap: 2px;
  }

  .today-badge {
    padding: 2px 5px;
    font-size: 8px;
  }

  .day-amount {
    font-size: 9px;
  }

  .summary-panel {
    padding: 14px 14px 16px;
  }

  .summary-card {
    min-height: 84px;
    padding: 12px 6px;
  }

  .summary-card p {
    font-size: 12px;
  }

  .summary-card strong {
    font-size: 15px;
  }

  .create-button {
    right: 14px;
    bottom: 14px;
    width: 48px;
    height: 48px;
    font-size: 28px;
  }
}

@media (min-width: 768px) {
  .calendar-panel {
    padding: 28px 26px 62px;
  }

  .calendar-heading h1,
  .summary-title-row h2 {
    font-size: 22px;
  }

  .weekday-label {
    font-size: 15px;
  }

  .date-cell {
    min-height: 96px;
    padding-top: 12px;
  }

  .day-number {
    font-size: 17px;
  }

  .day-amount {
    font-size: 12px;
  }

  .summary-panel {
    padding: 20px 20px 22px;
  }

  .summary-card {
    min-height: 120px;
    padding: 20px 12px;
  }

  .summary-card strong {
    font-size: 22px;
  }

  .create-button {
    right: 20px;
    bottom: 20px;
    width: 62px;
    height: 62px;
    font-size: 36px;
  }

  .today-badge {
    padding: 3px 7px;
    font-size: 10px;
  }
}
</style>
