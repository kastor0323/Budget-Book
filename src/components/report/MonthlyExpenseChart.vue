// 월별 지출을 보여주는 그래프 컴포넌트

<template>
  <section class="card">
    <h2 class="section-title">최근 6개월 지출 추이</h2>

    <div class="chart-wrapper">
      <div class="chart-area">
        <div class="y-axis">
          <span>{{ yAxisLabels[0] }}</span>
          <span>{{ yAxisLabels[1] }}</span>
          <span>{{ yAxisLabels[2] }}</span>
          <span>{{ yAxisLabels[3] }}</span>
          <span>{{ yAxisLabels[4] }}</span>
        </div>

        <div class="chart-main">
          <div class="grid-line line-1"></div>
          <div class="grid-line line-2"></div>
          <div class="grid-line line-3"></div>
          <div class="grid-line line-4"></div>
          <div class="grid-line line-5"></div>

          <div class="bars">
            <div
              v-for="item in chartData"
              :key="item.key"
              class="bar-column"
              @click="emit('select-month', item)"
              @mouseenter="hoveredKey = item.key"
              @mouseleave="hoveredKey = null"
            >
              <div v-if="hoveredKey === item.key" class="bar-tooltip">
                <p class="tooltip-month">{{ item.month }}</p>
                <p class="tooltip-amount">
                  지출: {{ item.amount.toLocaleString() }}원
                </p>
              </div>

              <div class="bar-box">
                <div
                  class="bar"
                  :class="{ active: item.key === selectedKey }"
                  :style="{
                    height: getBarHeightPercent(item.amount) + '%',
                    backgroundColor:
                      item.key === selectedKey ? '#FFBB00' : '#C9CED6',
                  }"
                ></div>
              </div>

              <div class="bar-label">{{ item.month }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <p class="chart-guide">
      💡 막대를 클릭하면 해당 월의 상세 분석을 볼 수 있습니다
    </p>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  monthlyData: {
    type: Array,
    default: () => [],
  },
  selectedKey: {
    type: String,
    default: '',
  },
  yAxisLabels: {
    type: Array,
    default: () => ['0만', '0만', '0만', '0만', '0만'],
  },
});

const emit = defineEmits(['select-month']);

const hoveredKey = ref(null);

const maxAmount = computed(() => {
  const max = Math.max(...props.monthlyData.map((item) => item.amount), 0);
  return max === 0 ? 100000 : max;
});

const getBarHeightPercent = (amount) => {
  return (amount / maxAmount.value) * 100;
};

const chartData = computed(() => {
  return props.monthlyData.map((item) => ({
    ...item,
  }));
});
</script>

<style scoped>
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

.chart-wrapper {
  width: 100%;
  overflow-x: auto;
}

.chart-area {
  display: flex;
  gap: 16px;
  min-width: 920px;
}

.y-axis {
  width: 70px;
  height: 260px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 28px;
  color: #6b7280;
  font-size: 14px;
  text-align: right;
  flex-shrink: 0;
}

.chart-main {
  position: relative;
  flex: 1;
  height: 260px;
  border-left: 1px solid #d1d5db;
  border-bottom: 1px solid #d1d5db;
  padding: 0 16px;
}

.grid-line {
  position: absolute;
  left: 0;
  right: 0;
  border-top: 1px dashed #e5e7eb;
}

.line-1 {
  top: 0%;
}
.line-2 {
  top: 25%;
}
.line-3 {
  top: 50%;
}
.line-4 {
  top: 75%;
}
.line-5 {
  top: 100%;
}

.bars {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.bar-column {
  position: relative;
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.bar-box {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bar {
  width: 100%;
  max-width: 150px;
  min-width: 60px;
  border-radius: 12px 12px 0 0;
  transition: all 0.2s ease;
}

.bar.active {
  box-shadow: 0 0 0 2px rgba(255, 187, 0, 0.18);
}

.bar-tooltip {
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  min-width: 120px;
  max-width: 170px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
  padding: 10px 12px;
  text-align: left;
  z-index: 20;
  pointer-events: none;
}

.tooltip-month {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}

.tooltip-amount {
  font-size: 13px;
  color: #64748b;
  white-space: nowrap;
}

.bar-label {
  margin-top: 10px;
  font-size: 15px;
  color: #6b7280;
  white-space: nowrap;
}

.chart-guide {
  text-align: center;
  margin-top: 20px;
  color: #6b7280;
  font-size: 16px;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .card {
    padding: 18px;
    border-radius: 18px;
    margin-bottom: 18px;
  }

  .section-title {
    font-size: 18px;
    margin-bottom: 18px;
  }

  .chart-wrapper {
    overflow-x: hidden;
  }

  .chart-area {
    min-width: 100%;
    gap: 8px;
  }

  .y-axis {
    width: 38px;
    height: 210px;
    font-size: 10px;
    padding-bottom: 24px;
  }

  .chart-main {
    height: 210px;
    padding: 0 4px;
  }

  .bars {
    gap: 8px;
  }

  .bar {
    min-width: 0;
    max-width: 42px;
    border-radius: 8px 8px 0 0;
  }

  .bar-label {
    font-size: 11px;
    margin-top: 6px;
  }

  .bar-tooltip {
    min-width: 100px;
    padding: 8px 10px;
  }

  .chart-guide {
    font-size: 12px;
    margin-top: 14px;
    line-height: 1.4;
  }
}
</style>
