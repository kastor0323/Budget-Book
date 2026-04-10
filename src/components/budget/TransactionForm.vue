// 거래 정보 추가 입력 폼 (금액, 카테고리 등)

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  selectedDate: {
    type: String,
    default: '',
  },
  categoryGroups: {
    type: Object,
    default: () => ({
      income: [],
      expense: [],
    }),
  },
});

const emit = defineEmits(['close', 'save']);

const formData = ref({
  type: 'expense',
  date: '',
  history: '',
  amount: '',
  category: '',
  memo: '',
});

const availableCategories = computed(() => {
  return props.categoryGroups[formData.value.type] || [];
});

function resetForm() {
  formData.value = {
    type: 'expense',
    date: props.selectedDate || '',
    history: '',
    amount: '',
    category: props.categoryGroups.expense?.[0] || '',
    memo: '',
  };
}

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      resetForm();
    }
  },
  { immediate: true },
);

watch(
  () => formData.value.type,
  (newType) => {
    const categories = props.categoryGroups[newType] || [];
    formData.value.category = categories[0] || '';
  },
);

function handleSubmit() {
  if (
    !formData.value.date ||
    !formData.value.history ||
    !formData.value.amount ||
    !formData.value.category
  ) {
    alert('필수 항목을 모두 입력해주세요.');
    return;
  }

  emit('save', {
    ...formData.value,
    amount: Number(formData.value.amount),
  });
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <h3>거래 내역 추가</h3>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>분류</label>
          <select v-model="formData.type">
            <option value="income">수입</option>
            <option value="expense">지출</option>
          </select>
        </div>

        <div class="form-group">
          <label>날짜</label>
          <input type="date" v-model="formData.date" required />
        </div>

        <div class="form-group">
          <label>내역</label>
          <input type="text" v-model="formData.history" required />
        </div>

        <div class="form-group">
          <label>금액</label>
          <input type="number" v-model="formData.amount" required />
        </div>

        <div class="form-group">
          <label>카테고리</label>
          <select v-model="formData.category" required>
            <option value="" disabled>선택하세요</option>
            <option v-for="cat in availableCategories" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>메모</label>
          <input type="text" v-model="formData.memo" />
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="emit('close')">
            취소
          </button>
          <button type="submit" class="btn-save">저장</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(36, 52, 86, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #ffffff;
  padding: 28px;
  border-radius: 24px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 12px 30px rgba(36, 52, 86, 0.1);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 24px;
  color: #1b2741;
  font-size: 22px;
  font-weight: 800;
}

.form-group {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #44506a;
  font-size: 14px;
  font-weight: 700;
}

.form-group input,
.form-group select {
  height: 48px;
  padding: 0 14px;
  border: 1px solid #dfe6f2;
  border-radius: 14px;
  background: #ffffff;
  color: #243250;
  font-size: 15px;
  font-weight: 600;
  outline: none;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

.modal-actions button {
  flex: 1;
  height: 52px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.btn-cancel {
  background: #ffffff;
  border: 1px solid #dfe6f2;
  color: #6c7894;
}

.btn-save {
  background: #6876ff;
  border: none;
  color: #ffffff;
}
</style>
