import axios from 'axios';
import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { useAuthStore } from './authStore';

const API_BASE_URL = 'http://localhost:3000';
const SELECTED_DATE_STORAGE_KEY = 'budget:selected-date';
const VISIBLE_MONTH_STORAGE_KEY = 'budget:visible-month';
const FILTERS_STORAGE_KEY = 'budget:filters';
const MONTH_VIEW_SENTINEL = '__MONTH_VIEW__';
const CATEGORY_OPTIONS = {
  income: ['\uC6D4\uAE09', '\uC6A9\uB3C8', '\uAE30\uD0C0 \uC218\uC775'],
  expense: [
    '\uC2DD\uBE44',
    '\uC8FC\uAC70/\uC0DD\uD65C\uBE44',
    '\uAD50\uD1B5\uBE44',
    '\uC5EC\uAC00\uBE44',
    '\uAE30\uD0C0 \uC9C0\uCD9C',
  ],
};

function createDateKey(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return { year, month, day };
}

function getDefaultTodayDate() {
  const today = new Date();
  return createDateKey(today.getFullYear(), today.getMonth() + 1, today.getDate());
}

function getStoredSelectedDate() {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.sessionStorage.getItem(SELECTED_DATE_STORAGE_KEY) || '';
}

function getStoredVisibleMonth() {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.sessionStorage.getItem(VISIBLE_MONTH_STORAGE_KEY) || '';
}

function getDefaultFilters() {
  return {
    type: 'all',
    category: 'all',
    sort: 'amount-desc',
  };
}

function getStoredFilters() {
  if (typeof window === 'undefined') {
    return getDefaultFilters();
  }

  const rawFilters = window.sessionStorage.getItem(FILTERS_STORAGE_KEY);

  if (!rawFilters) {
    return getDefaultFilters();
  }

  try {
    return {
      ...getDefaultFilters(),
      ...JSON.parse(rawFilters),
    };
  } catch {
    return getDefaultFilters();
  }
}

function normalizeLedgerEntries(items, type) {
  return items.map((item) => ({
    id: item.id,
    date: item.date,
    amount: Number(item.money) || 0,
    type,
    category: item.category ?? '',
    memo: item.memo ?? '',
    history: item.history ?? '',
  }));
}

export const useBudgetStore = defineStore('budget', () => {
  const today = new Date();
  const storedSelectedDate = getStoredSelectedDate();
  const storedVisibleMonth = getStoredVisibleMonth();
  const initialSelectedDate =
    storedSelectedDate && storedSelectedDate !== MONTH_VIEW_SENTINEL
      ? storedSelectedDate
      : storedSelectedDate === MONTH_VIEW_SENTINEL
        ? ''
        : getDefaultTodayDate();
  const initialMonthSource =
    storedVisibleMonth ||
    (initialSelectedDate ? initialSelectedDate.slice(0, 7) : getDefaultTodayDate().slice(0, 7));
  const [initialYear, initialMonth] = initialMonthSource.split('-').map(Number);

  const selectedDate = ref(initialSelectedDate);
  const visibleMonth = ref(
    new Date(initialYear, initialMonth - 1, 1),
  );
  const incomeEntries = ref([]);
  const expenditureEntries = ref([]);
  const isLoading = ref(false);
  const loadError = ref('');
  const filters = ref(getStoredFilters());

  function resetFiltersForScopeChange() {
    filters.value = getDefaultFilters();
    persistFilters();
  }

  const ledgerEntries = computed(() => [
    ...incomeEntries.value,
    ...expenditureEntries.value,
  ]);

  const selectedTransactions = computed(() => {
    if (selectedDate.value) {
      return ledgerEntries.value.filter((entry) => entry.date === selectedDate.value);
    }
    const year = visibleMonth.value.getFullYear();
    const month = String(visibleMonth.value.getMonth() + 1).padStart(2, '0');
    const prefix = `${year}-${month}`;
    return ledgerEntries.value.filter((entry) => entry.date.startsWith(prefix));
  });

  const categoryOptions = computed(() => {
    if (filters.value.type === 'income') {
      return CATEGORY_OPTIONS.income;
    }

    if (filters.value.type === 'expense') {
      return CATEGORY_OPTIONS.expense;
    }

    return [...CATEGORY_OPTIONS.income, ...CATEGORY_OPTIONS.expense];
  });

  const categoryGroups = computed(() => ({
    income: CATEGORY_OPTIONS.income,
    expense: CATEGORY_OPTIONS.expense,
  }));

  const filteredTransactions = computed(() => {
    let items = [...selectedTransactions.value];

    if (filters.value.type !== 'all') {
      items = items.filter((entry) => entry.type === filters.value.type);
    }

    if (filters.value.category !== 'all') {
      items = items.filter(
        (entry) => entry.category === filters.value.category,
      );
    }

    if (filters.value.sort === 'amount-desc') {
      items.sort((left, right) => right.amount - left.amount);
    } else if (filters.value.sort === 'amount-asc') {
      items.sort((left, right) => left.amount - right.amount);
    } else if (filters.value.sort === 'time-asc') {
      items.sort((left, right) => left.id - right.id);
    } else {
      items.sort((left, right) => right.id - left.id);
    }

    return items;
  });

  const summarySourceTransactions = computed(() => selectedTransactions.value);

  function ensureValidCategory() {
    const stillExists =
      filters.value.category === 'all' ||
      categoryOptions.value.includes(filters.value.category);

    if (!stillExists) {
      filters.value = {
        ...filters.value,
        category: 'all',
      };
    }
  }

  const selectedSummaryTransactions = computed(() => {
    ensureValidCategory();
    return filteredTransactions.value;
  });

  function persistSelectedDate() {
    if (typeof window === 'undefined') {
      return;
    }

    if (selectedDate.value) {
      window.sessionStorage.setItem(SELECTED_DATE_STORAGE_KEY, selectedDate.value);
    } else {
      window.sessionStorage.setItem(SELECTED_DATE_STORAGE_KEY, MONTH_VIEW_SENTINEL);
    }
  }

  function persistVisibleMonth() {
    if (typeof window === 'undefined') {
      return;
    }

    const monthKey = `${visibleMonth.value.getFullYear()}-${String(
      visibleMonth.value.getMonth() + 1,
    ).padStart(2, '0')}`;
    window.sessionStorage.setItem(VISIBLE_MONTH_STORAGE_KEY, monthKey);
  }

  function persistFilters() {
    if (typeof window === 'undefined') {
      return;
    }

    window.sessionStorage.setItem(
      FILTERS_STORAGE_KEY,
      JSON.stringify(filters.value),
    );
  }

  function persistCalendarState() {
    persistSelectedDate();
    persistVisibleMonth();
  }

  function focusDate(dateKey, options = {}) {
    const { resetFilters = false } = options;

    if (!dateKey) {
      return;
    }

    const { year, month } = parseDateKey(dateKey);
    visibleMonth.value = new Date(year, month - 1, 1);
    selectedDate.value = dateKey;

    if (resetFilters) {
      resetFiltersForScopeChange();
    }

    persistCalendarState();
  }

  function focusMonth(monthDate, options = {}) {
    const { resetFilters = false } = options;

    visibleMonth.value = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth(),
      1,
    );
    selectedDate.value = '';

    if (resetFilters) {
      resetFiltersForScopeChange();
    }

    persistCalendarState();
  }

  async function loadLedgerEntries() {
    isLoading.value = true;
    loadError.value = '';

    try {
      const authStore = useAuthStore();
      const userEmail = authStore.currentUser?.email || '';

      const [incomeResponse, expenditureResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/income?user=${userEmail}`),
        axios.get(`${API_BASE_URL}/expenditure?user=${userEmail}`),
      ]);

      incomeEntries.value = normalizeLedgerEntries(
        incomeResponse.data,
        'income',
      );
      expenditureEntries.value = normalizeLedgerEntries(
        expenditureResponse.data,
        'expense',
      );
    } catch (error) {
      loadError.value =
        '\uAC00\uACC4\uBD80 \uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.';
      incomeEntries.value = [];
      expenditureEntries.value = [];
    } finally {
      const storedDate = getStoredSelectedDate();

      if (!selectedDate.value && !storedDate) {
        focusDate(getDefaultTodayDate());
      } else {
        persistCalendarState();
      }

      persistFilters();

      isLoading.value = false;
    }
  }

  async function updateTransaction(id, type, updatedData) {
    const hadSelectedDate = Boolean(selectedDate.value);
    const currentMonth = new Date(
      visibleMonth.value.getFullYear(),
      visibleMonth.value.getMonth(),
      1,
    );

    try {
      const endpoint = type === 'income' ? 'income' : 'expenditure';

      const serverData = {
        date: updatedData.date,
        money: updatedData.amount,
        category: updatedData.category,
        memo: updatedData.memo,
        history: updatedData.history,
      };

      await axios.patch(`${API_BASE_URL}/${endpoint}/${id}`, serverData);
      await loadLedgerEntries();

      if (hadSelectedDate) {
        focusDate(updatedData.date);
      } else {
        focusMonth(currentMonth);
      }
    } catch (error) {
      console.error('\uAC00\uACC4\uBD80 \uC218\uC815 \uC2E4\uD328', error);
      alert('\uC218\uC815\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.');
    }
  }

  async function deleteTransaction(id, type) {
    const hadSelectedDate = Boolean(selectedDate.value);
    const currentMonth = new Date(
      visibleMonth.value.getFullYear(),
      visibleMonth.value.getMonth(),
      1,
    );

    try {
      console.log(
        `[deleteTransaction] Starting deletion for id: ${id}, type: ${type}`,
      );
      const endpoint = type === 'income' ? 'income' : 'expenditure';
      const targetUrl = `${API_BASE_URL}/${endpoint}/${id}`;
      console.log(`[deleteTransaction] Making DELETE request to: ${targetUrl}`);

      const response = await axios.delete(targetUrl);
      console.log(
        `[deleteTransaction] Request successful. Status:`,
        response.status,
      );

      await loadLedgerEntries();

      if (hadSelectedDate) {
        const fallbackDate = selectedDate.value || getDefaultTodayDate();
        focusDate(fallbackDate);
      } else {
        focusMonth(currentMonth);
      }
      console.log(`[deleteTransaction] Reload complete.`);
    } catch (error) {
      console.error('\uAC00\uACC4\uBD80 \uC0AD\uC81C \uC2E4\uD328', error);
      alert(
        '\uC0AD\uC81C\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4: ' +
          (error.message || ''),
      );
    }
  }

  function changeMonth(offset) {
    visibleMonth.value = new Date(
      visibleMonth.value.getFullYear(),
      visibleMonth.value.getMonth() + offset,
      1,
    );
    selectedDate.value = '';
    resetFiltersForScopeChange();
    persistCalendarState();
  }

  function toggleSelectedDate(dateKey) {
    if (selectedDate.value === dateKey) {
      selectedDate.value = '';
    } else {
      selectedDate.value = dateKey;
    }

    resetFiltersForScopeChange();
    persistCalendarState();
  }

  function updateFilters(nextFilters) {
    const mergedFilters = {
      ...filters.value,
      ...nextFilters,
    };

    if (nextFilters.category && nextFilters.category !== 'all') {
      if (CATEGORY_OPTIONS.income.includes(nextFilters.category)) {
        mergedFilters.type = 'income';
      } else if (CATEGORY_OPTIONS.expense.includes(nextFilters.category)) {
        mergedFilters.type = 'expense';
      }
    }

    if (nextFilters.type && nextFilters.type === 'all' && filters.value.category !== 'all') {
      mergedFilters.category = 'all';
    }

    filters.value = mergedFilters;
    persistFilters();
  }

  return {
    selectedDate,
    visibleMonth,
    incomeEntries,
    expenditureEntries,
    isLoading,
    loadError,
    filters,
    ledgerEntries,
    selectedTransactions,
    categoryOptions,
    categoryGroups,
    selectedSummaryTransactions,
    summarySourceTransactions,
    loadLedgerEntries,
    changeMonth,
    toggleSelectedDate,
    focusDate,
    focusMonth,
    updateFilters,
    createDateKey,
    updateTransaction,
    deleteTransaction,
  };
});
