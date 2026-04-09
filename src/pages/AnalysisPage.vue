<template>
  <div class="analysis-page">
    <header class="page-header">
      <button class="back-button" @click="goCalendar">
        <ArrowLeft class="icon-sm" />
        <span>캘린더로 돌아가기</span>
      </button>

      <div class="header-row">
        <h1 class="page-title">소비 분석</h1>
      </div>
    </header>

    <main class="page-content">
      <section class="summary-card">
        <div class="summary-top">
          <TrendingDown class="icon-md white" />
          <h2 class="summary-month">
            {{ selectedYear }}년 {{ selectedMonth }}
          </h2>
        </div>

        <p class="summary-amount">{{ totalExpense.toLocaleString() }}원</p>
        <p class="summary-label">총 지출</p>
      </section>

      <CategoryExpenseList
        :selected-month="selectedMonth"
        :category-data="categoryData"
      />

      <MonthlyExpenseChart
        :monthly-data="monthlyData"
        :selected-key="selectedKey"
        :y-axis-labels="yAxisLabels"
        @select-month="handleBarClick"
      />

      <section class="card">
        <h2 class="section-title">월별 지출 비교</h2>

        <div class="table-wrap">
          <table class="expense-table">
            <thead>
              <tr>
                <th>월</th>
                <th>지출액</th>
                <th>전월 대비</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(data, index) in monthlyData"
                :key="data.key"
                :class="{ selectedRow: data.key === selectedKey }"
              >
                <td class="month-cell">
                  <span class="month-text">{{ data.month }}</span>
                  <span class="year-text">({{ data.year }})</span>
                </td>

                <td class="amount-cell">
                  {{ data.amount.toLocaleString() }}원
                </td>

                <td class="diff-cell">
                  <span v-if="index === 0" class="diff-neutral">-</span>
                  <span
                    v-else
                    :class="{
                      'diff-up': getDiffInfo(index).diff > 0,
                      'diff-down': getDiffInfo(index).diff < 0,
                      'diff-neutral': getDiffInfo(index).diff === 0,
                    }"
                  >
                    {{ getDiffText(index) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { ArrowLeft, Download, TrendingDown } from 'lucide-vue-next';
import CategoryExpenseList from '@/components/budget/CategoryExpenseList.vue';
import MonthlyExpenseChart from '@/components/report/MonthlyExpenseChart.vue';

const router = useRouter();

const expenditures = ref([]);
const selectedKey = ref('');

const getCurrentUserEmail = () => {
  const storedUser = localStorage.getItem('currentUser');
  if (!storedUser) return '';

  try {
    const parsedUser = JSON.parse(storedUser);
    return parsedUser.email || '';
  } catch (error) {
    console.error('currentUser 파싱 실패:', error);
    return '';
  }
};

const currentUserEmail = ref(getCurrentUserEmail());

const categoryColorMap = {
  식비: '#FFBB00',
  '주거/생활비': '#22C55E',
  교통비: '#3B82F6',
  여가비: '#A855F7',
  '기타 지출': '#9CA3AF',
};

const categoryOrder = ['식비', '주거/생활비', '교통비', '여가비', '기타 지출'];

const fetchExpenditureData = async () => {
  try {
    const response = await axios.get(
      `http://localhost:3000/expenditure?user=${encodeURIComponent(currentUserEmail.value)}`,
    );
    console.log('지출 응답 데이터:', response.data);

    if (Array.isArray(response.data)) {
      expenditures.value = response.data;
    } else {
      expenditures.value = [];
      console.warn('expenditure 데이터가 배열이 아닙니다.');
    }
  } catch (error) {
    console.error('지출 데이터 조회 실패:', error);
    expenditures.value = [];
  }
};

const parseDate = (dateString) => {
  const date = new Date(dateString);
  return {
    year: date.getFullYear(),
    monthNumber: date.getMonth() + 1,
    monthLabel: `${date.getMonth() + 1}월`,
    key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
  };
};

const getRecentSixMonths = () => {
  const result = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const temp = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = temp.getFullYear();
    const monthNumber = temp.getMonth() + 1;

    result.push({
      year,
      month: `${monthNumber}월`,
      key: `${year}-${String(monthNumber).padStart(2, '0')}`,
    });
  }

  return result;
};

const userExpenditures = computed(() => {
  const safeExpenditures = Array.isArray(expenditures.value)
    ? expenditures.value
    : [];

  if (!currentUserEmail.value) return [];

  return safeExpenditures.filter(
    (item) => item.user === currentUserEmail.value,
  );
});

const monthlyData = computed(() => {
  const recentMonths = getRecentSixMonths();

  return recentMonths.map((monthInfo) => {
    const total = userExpenditures.value
      .filter((item) => {
        const parsed = parseDate(item.date);
        return parsed.key === monthInfo.key;
      })
      .reduce((sum, item) => sum + Number(item.money), 0);

    return {
      ...monthInfo,
      amount: total,
    };
  });
});

const selectedMonthInfo = computed(() => {
  return (
    monthlyData.value.find((item) => item.key === selectedKey.value) ||
    monthlyData.value[monthlyData.value.length - 1]
  );
});

const selectedMonth = computed(() => selectedMonthInfo.value?.month || '');
const selectedYear = computed(() => selectedMonthInfo.value?.year || '');

const selectedMonthExpenditures = computed(() => {
  return userExpenditures.value.filter((item) => {
    const parsed = parseDate(item.date);
    return parsed.key === selectedKey.value;
  });
});

const totalExpense = computed(() => {
  return selectedMonthExpenditures.value.reduce(
    (sum, item) => sum + Number(item.money),
    0,
  );
});

const categoryData = computed(() => {
  const categoryTotals = {};

  categoryOrder.forEach((category) => {
    categoryTotals[category] = 0;
  });

  selectedMonthExpenditures.value.forEach((item) => {
    const category = categoryOrder.includes(item.category)
      ? item.category
      : '기타 지출';

    categoryTotals[category] += Number(item.money);
  });

  return categoryOrder
    .map((category) => {
      const amount = categoryTotals[category];
      const percentage =
        totalExpense.value === 0
          ? 0
          : Number(((amount / totalExpense.value) * 100).toFixed(1));

      return {
        category,
        amount,
        percentage,
        color: categoryColorMap[category],
      };
    })
    .filter((item) => item.amount > 0 || totalExpense.value === 0);
});

const maxAmount = computed(() => {
  const max = Math.max(...monthlyData.value.map((item) => item.amount), 0);
  return max === 0 ? 100000 : max;
});

const formatToMan = (value) => {
  return `${Math.round(value / 10000)}만`;
};

const yAxisLabels = computed(() => {
  const top = Math.ceil(maxAmount.value / 100000) * 100000;
  return [
    formatToMan(top),
    formatToMan(top * 0.75),
    formatToMan(top * 0.5),
    formatToMan(top * 0.25),
    '0만',
  ];
});

const getDiffInfo = (index) => {
  const currentAmount = monthlyData.value[index].amount;
  const prevAmount = monthlyData.value[index - 1].amount;
  const diff = currentAmount - prevAmount;

  const diffPercent =
    prevAmount === 0 ? 0 : Number(((diff / prevAmount) * 100).toFixed(1));

  return { diff, diffPercent };
};

const getDiffText = (index) => {
  const { diff, diffPercent } = getDiffInfo(index);
  return `${diff > 0 ? '+' : ''}${diff.toLocaleString()}원 (${diffPercent}%)`;
};

const handleBarClick = (item) => {
  selectedKey.value = item.key;
};

const goCalendar = () => {
  router.push('/ledgers');
};

onMounted(async () => {
  await fetchExpenditureData();

  if (monthlyData.value.length > 0) {
    selectedKey.value = monthlyData.value[monthlyData.value.length - 1].key;
  }
});
</script>

<style scoped>
.analysis-page {
  min-height: 100vh;
  background-color: #f3f4f6;
  color: #1e293b;
}

.page-header {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 20px 24px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-button {
  border: none;
  background: transparent;
  color: #475569;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 16px;
  margin-bottom: 18px;
  white-space: nowrap;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
}

.excel-button {
  border: none;
  background: #16a34a;
  color: white;
  padding: 12px 18px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
}

.page-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px 20px 40px;
}

.summary-card {
  background: linear-gradient(135deg, #ffbb00 0%, #f5a200 100%);
  color: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.summary-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.summary-month {
  font-size: 18px;
  font-weight: 700;
}

.summary-amount {
  font-size: 42px;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 8px;
}

.summary-label {
  font-size: 16px;
  color: #fff7d6;
}

.card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
  padding: 28px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 24px;
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
}

.expense-table {
  width: 100%;
  min-width: 860px;
  border-collapse: collapse;
}

.expense-table thead th {
  text-align: left;
  font-size: 18px;
  font-weight: 800;
  color: #334155;
  padding: 16px 18px;
  border-bottom: 1px solid #e5e7eb;
}

.expense-table thead th:nth-child(2),
.expense-table thead th:nth-child(3) {
  text-align: right;
}

.expense-table tbody td {
  padding: 18px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 18px;
}

.expense-table tbody tr.selectedRow {
  background: #f8edc7;
}

.month-text {
  font-weight: 700;
  margin-right: 6px;
}

.year-text {
  color: #64748b;
}

.amount-cell,
.diff-cell {
  text-align: right;
  font-weight: 700;
  white-space: nowrap;
}

.diff-up {
  color: #dc2626;
  font-weight: 800;
}

.diff-down {
  color: #2563eb;
  font-weight: 800;
}

.diff-neutral {
  color: #94a3b8;
  font-weight: 700;
}

.icon-sm {
  width: 20px;
  height: 20px;
}

.icon-md {
  width: 26px;
  height: 26px;
}

.white {
  color: white;
}

@media (max-width: 768px) {
  .page-header {
    padding: 16px;
  }

  .header-row {
    flex-direction: column;
    align-items: stretch;
  }

  .page-title {
    font-size: 22px;
  }

  .excel-button {
    width: 100%;
    font-size: 14px;
    padding: 10px 14px;
  }

  .page-content {
    padding: 16px 14px 28px;
  }

  .summary-card,
  .card {
    padding: 18px;
    border-radius: 18px;
  }

  .section-title {
    font-size: 18px;
  }

  .table-wrap {
    overflow-x: hidden;
  }

  .expense-table {
    min-width: 100%;
  }

  .expense-table thead th {
    font-size: 12px;
    padding: 10px 4px;
  }

  .expense-table tbody td {
    font-size: 11px;
    padding: 12px 4px;
  }
}
</style>
