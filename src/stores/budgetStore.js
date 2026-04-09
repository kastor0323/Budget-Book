import axios from 'axios'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const API_BASE_URL = 'http://localhost:3000'
const CATEGORY_OPTIONS = {
  income: ['\uC6D4\uAE09', '\uC6A9\uB3C8', '\uAE30\uD0C0 \uC218\uC775'],
  expense: [
    '\uC2DD\uBE44',
    '\uC8FC\uAC70/\uC0DD\uD65C\uBE44',
    '\uAD50\uD1B5\uBE44',
    '\uC5EC\uAC00\uBE44',
    '\uAE30\uD0C0 \uC9C0\uCD9C',
  ],
}

function createDateKey(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
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
  }))
}

export const useBudgetStore = defineStore('budget', () => {
  const today = new Date()
  const selectedDate = ref('')
  const visibleMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1))
  const incomeEntries = ref([])
  const expenditureEntries = ref([])
  const isLoading = ref(false)
  const loadError = ref('')
  const filters = ref({
    type: 'all',
    category: 'all',
    sort: 'time-desc',
  })

  const ledgerEntries = computed(() => [
    ...incomeEntries.value,
    ...expenditureEntries.value,
  ])

  const selectedTransactions = computed(() =>
    ledgerEntries.value.filter((entry) => entry.date === selectedDate.value),
  )

  const categoryOptions = computed(() => {
    if (filters.value.type === 'income') {
      return CATEGORY_OPTIONS.income
    }

    if (filters.value.type === 'expense') {
      return CATEGORY_OPTIONS.expense
    }

    return [...CATEGORY_OPTIONS.income, ...CATEGORY_OPTIONS.expense]
  })

  const categoryGroups = computed(() => ({
    income: CATEGORY_OPTIONS.income,
    expense: CATEGORY_OPTIONS.expense,
  }))

  const filteredTransactions = computed(() => {
    let items = [...selectedTransactions.value]

    if (filters.value.type !== 'all') {
      items = items.filter((entry) => entry.type === filters.value.type)
    }

    if (filters.value.category !== 'all') {
      items = items.filter((entry) => entry.category === filters.value.category)
    }

    if (filters.value.sort === 'amount-desc') {
      items.sort((left, right) => right.amount - left.amount)
    } else if (filters.value.sort === 'amount-asc') {
      items.sort((left, right) => left.amount - right.amount)
    } else if (filters.value.sort === 'time-asc') {
      items.sort((left, right) => left.id - right.id)
    } else {
      items.sort((left, right) => right.id - left.id)
    }

    return items
  })

  const summarySourceTransactions = computed(() => selectedTransactions.value)

  function ensureValidCategory() {
    const stillExists =
      filters.value.category === 'all' ||
      categoryOptions.value.includes(filters.value.category)

    if (!stillExists) {
      filters.value = {
        ...filters.value,
        category: 'all',
      }
    }
  }

  const selectedSummaryTransactions = computed(() => {
    ensureValidCategory()
    return filteredTransactions.value
  })

  async function loadLedgerEntries() {
    isLoading.value = true
    loadError.value = ''

    try {
      const [incomeResponse, expenditureResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/income`),
        axios.get(`${API_BASE_URL}/expenditure`),
      ])

      incomeEntries.value = normalizeLedgerEntries(incomeResponse.data, 'income')
      expenditureEntries.value = normalizeLedgerEntries(expenditureResponse.data, 'expense')
    } catch (error) {
      loadError.value = '\uAC00\uACC4\uBD80 \uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.'
      incomeEntries.value = []
      expenditureEntries.value = []
    } finally {
      isLoading.value = false
    }
  }

  function changeMonth(offset) {
    visibleMonth.value = new Date(
      visibleMonth.value.getFullYear(),
      visibleMonth.value.getMonth() + offset,
      1,
    )
    selectedDate.value = ''
  }

  function toggleSelectedDate(dateKey) {
    selectedDate.value = selectedDate.value === dateKey ? '' : dateKey
  }

  function updateFilters(nextFilters) {
    filters.value = {
      ...filters.value,
      ...nextFilters,
    }
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
    updateFilters,
    createDateKey,
  }
})
