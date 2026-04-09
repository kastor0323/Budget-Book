<script setup>
import { ref, watch, computed } from 'vue';
import { useBudgetStore } from '../../stores/budgetStore';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  transaction: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'save']);
const store = useBudgetStore();

const formData = ref({
  id: '',
  type: 'income',
  date: '',
  amount: 0,
  category: '',
  history: '',
  memo: ''
});

watch(() => props.transaction, (newVal) => {
  if (newVal) {
    formData.value = { ...newVal };
  }
}, { immediate: true });

const availableCategories = computed(() => {
  return store.categoryGroups[formData.value.type] || [];
});

function handleSubmit() {
  emit('save', { ...formData.value });
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <h3>거래 내역 수정</h3>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>분류</label>
          <select v-model="formData.type" disabled>
            <option value="income">수입</option>
            <option value="expense">지출</option>
          </select>
        </div>
        <div class="form-group border-style">
          <label>날짜</label>
          <input type="date" v-model="formData.date" required />
        </div>
        <div class="form-group border-style">
          <label>내역</label>
          <input type="text" v-model="formData.history" required />
        </div>
        <div class="form-group border-style">
          <label>금액</label>
          <input type="number" v-model="formData.amount" required />
        </div>
        <div class="form-group border-style">
          <label>카테고리</label>
          <select v-model="formData.category" required>
            <option value="" disabled>선택하세요</option>
            <option v-for="cat in availableCategories" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
        </div>
        <div class="form-group border-style">
          <label>메모</label>
          <input type="text" v-model="formData.memo" />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="emit('close')">취소</button>
          <button type="submit" class="btn-save">저장</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  animation: modalIn 0.2s ease-out forwards;
}

@keyframes modalIn {
  0% { opacity: 0; transform: scale(0.95) translateY(10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 24px;
  color: #1b2741;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.03em;
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

.form-group input, .form-group select {
  height: 48px;
  padding: 0 14px;
  border: 1px solid #dfe6f2;
  border-radius: 14px;
  background: #ffffff;
  color: #243250;
  font-size: 15px;
  font-weight: 600;
  outline: none;
  transition: all 0.2s ease;
}

.form-group input:focus, .form-group select:focus {
  border-color: #96a3ff;
  box-shadow: 0 0 0 4px rgba(104, 118, 255, 0.12);
}

.form-group select:disabled {
  background: #f8f9fc;
  color: #6c7894;
  cursor: not-allowed;
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
  transition: all 0.2s ease;
}

.btn-cancel {
  background: #ffffff;
  border: 1px solid #dfe6f2;
  color: #6c7894;
}

.btn-cancel:hover {
  background: #f8f9fc;
  color: #243250;
}

.btn-save {
  background: #6876ff;
  border: none;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(104, 118, 255, 0.3);
}

.btn-save:hover {
  background: #4f67ff;
  box-shadow: 0 6px 16px rgba(104, 118, 255, 0.4);
}
</style>
