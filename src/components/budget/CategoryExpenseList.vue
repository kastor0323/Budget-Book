<template>
  <section class="card">
    <h2 class="section-title">{{ selectedMonth }} 카테고리별 지출</h2>

    <div class="category-bar">
      <div
        v-for="cat in categoryData"
        :key="cat.category"
        class="category-bar-item"
        :style="{
          width: cat.percentage + '%',
          backgroundColor: cat.color,
        }"
        :title="`${cat.category}: ${cat.amount.toLocaleString()}원 (${cat.percentage}%)`"
      ></div>
    </div>

    <div class="category-list">
      <div
        v-for="cat in categoryData"
        :key="cat.category"
        class="category-item"
      >
        <div class="category-left">
          <div
            class="category-icon-wrap"
            :style="{ backgroundColor: hexToRgba(cat.color, 0.15) }"
          >
            <font-awesome-icon
              :icon="getCategoryIcon(cat.category)"
              class="category-icon"
              :style="{ color: cat.color }"
            />
          </div>

          <div class="category-text">
            <p class="category-name">{{ cat.category }}</p>
            <p class="category-percent">{{ cat.percentage }}%</p>
          </div>
        </div>

        <div class="category-amount">{{ cat.amount.toLocaleString() }}원</div>
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  selectedMonth: {
    type: String,
    default: '',
  },
  categoryData: {
    type: Array,
    default: () => [],
  },
});

const hexToRgba = (hex, alpha) => {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getCategoryIcon = (category) => {
  const iconMap = {
    식비: ['fas', 'utensils'],
    '주거/생활비': ['fas', 'house'],
    교통비: ['fas', 'bus'],
    여가비: ['fas', 'gamepad'],
    '기타 지출': ['fas', 'ellipsis'],
  };

  return iconMap[category] || ['fas', 'ellipsis'];
};
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

.category-bar {
  width: 100%;
  height: 38px;
  border-radius: 14px;
  overflow: hidden;
  background: #f1f5f9;
  display: flex;
  margin-bottom: 24px;
}

.category-bar-item {
  height: 100%;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 18px 22px;
  background: #f9fafb;
}

.category-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  flex: 1;
}

.category-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.category-icon {
  font-size: 20px;
}

.category-text {
  min-width: 0;
}

.category-name {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 3px;
  color: #0f172a;
  word-break: keep-all;
}

.category-percent {
  font-size: 14px;
  color: #64748b;
}

.category-amount {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  white-space: nowrap;
  margin-left: 12px;
  flex-shrink: 0;
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

  .category-bar {
    height: 28px;
    border-radius: 12px;
    margin-bottom: 18px;
  }

  .category-list {
    gap: 12px;
  }

  .category-item {
    padding: 14px;
    border-radius: 14px;
  }

  .category-left {
    gap: 12px;
  }

  .category-icon-wrap {
    width: 42px;
    height: 42px;
  }

  .category-icon {
    font-size: 17px;
  }

  .category-name {
    font-size: 16px;
  }

  .category-percent {
    font-size: 13px;
  }

  .category-amount {
    font-size: 16px;
  }
}
</style>
