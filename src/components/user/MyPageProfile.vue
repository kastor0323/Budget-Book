// 마이페이지에서 사용자 정보 표시
<template>
  <div class="mypage-container bg-light min-vh-100">
    <header
      class="bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between"
    >
      <div
        class="d-flex align-items-center"
        style="cursor: pointer"
        @click="goBack"
      >
        <i class="bi bi-arrow-left me-2"></i>
        <span class="text-secondary small"><- 캘린더로 돌아가기</span>
      </div>
    </header>
    <main class="container py-4" style="max-width: 800px">
      <h2 class="fw-bold mb-4">마이 페이지</h2>
      <section
        class="profile-card p-4 text-white mb-4 d-flex align-items-center shadow-sm"
      >
        <div class="profile-avatar bg-white me-4"></div>
        <div class="profile-info">
          <h3 class="fw-bold mb-1" v-if="authStore.currentUser">
            {{ authStore.currentUser.nickname }}
          </h3>
          <p class="mb-1 opacity-75" v-if="authStore.currentUser">
            {{ authStore.currentUser.email }}
          </p>
        </div>
      </section>
      <section
        class="card border-0 shadow-sm p-4 mb-4"
        style="border-radius: 20px"
      >
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h5 class="fw-bold mb-0">회원 정보</h5>
          <button
            @click="handleEditSave"
            :class="isEditing ? 'btn-success' : 'btn-warning'"
            class="btn fw-bold text-white px-4 py-2"
            style="border-radius: 10px"
          >
            {{ isEditing ? '저장하기' : '수정하기' }}
          </button>
        </div>

        <div class="mb-4">
          <label class="form-label text-secondary small fw-bold">
            <i class="bi bi-envelope me-1"></i>
            이메일
          </label>
          <input
            type="email"
            class="form-control bg-light border-0 py-3"
            :value="authStore.currentUser?.email"
            readonly
          />
          <p class="text-muted small mt-2 mb-0">이메일은 변경할 수 없습니다</p>
        </div>
        <div>
          <label class="form-label text-secondary small fw-bold">
            <i class="bi bi-person me-1"></i> 닉네임
          </label>
          <input
            v-model="nickname"
            type="text"
            class="form-control py-3"
            :class="isEditing ? 'bg-white border' : 'bg-light border-0'"
            :readonly="!isEditing"
            placeholder="닉네임을 입력하세요"
          />
        </div>
        <div>
          <label class="form-label text-secondary small fw-bold">
            <i class="bi bi-person me-1"></i> 비밀번호
          </label>
          <input
            v-model="password"
            type="password"
            class="form-control"
            :class="isEditing ? 'bg-white border' : 'bg-light border-0'"
            :readonly="!isEditing"
            placeholder="비밀번호 입력하세요"
          />
          <p v-if="isEditing" class="text-primary small mt-2 mb-0">
            * 현재 수정 모드입니다. 원하는 닉네임, 비밀번호로 변경 후
            저장하세요.
          </p>
        </div>
      </section>

      <section
        class="card border-0 shadow-sm p-4 mb-4"
        style="border-radius: 20px"
      >
        <h5 class="fw-bold mb-4">내 활동 통계</h5>
        <div class="row g-3">
          <div class="col-12 col-md-4">
            <div
              class="stat-box text-center p-3"
              style="background: #ebf4ff; color: #3182ce; border-radius: 16px"
            >
              <p class="small mb-1 text-secondary text-truncate">총 거래</p>
              <h4 class="fw-bold mb-0" v-if="store">
                {{ store.totalCount }}건
              </h4>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div
              class="stat-box text-center p-3"
              style="background: #f0fff4; color: #38a169; border-radius: 16px"
            >
              <p class="small mb-1 text-secondary text-truncate">총 수입</p>
              <h4 class="fw-bold mb-0" v-if="store">
                {{ store.totalIncome.toLocaleString() }}원
              </h4>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div
              class="stat-box text-center p-3"
              style="background: #fff5f5; color: #e53e3e; border-radius: 16px"
            >
              <p class="small mb-1 text-secondary text-truncate">총 지출</p>
              <h4 class="fw-bold mb-0" v-if="store">
                {{ store.totalExpenditure.toLocaleString() }}원
              </h4>
            </div>
          </div>
        </div>
      </section>
      <button
        class="btn btn-outline-danger w-100 border-1 py-3 mb-5"
        style="
          border-radius: 15px;
          background: #fff5f5;
          border-color: #fed7d7 !important;
        "
        @click="logout"
      >
        <i class="bi bi-box-arrow-right me-2"></i> 로그아웃
      </button>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBudgetStore1 } from '@/stores/budgetStore';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const authStore = useAuthStore();
const store = useBudgetStore1();

const nickname = ref('');
const password = ref('');

const isEditing = ref(false); // 수정 모드 여부

onMounted(async () => {
  authStore.initializeAuth();
  await store.fetchAll();
  if (authStore.currentUser) {
    nickname.value = authStore.currentUser?.nickname || '';
    password.value = authStore.currentUser?.password || '';
  }
});

//수정, 저장 버튼
const handleEditSave = async () => {
  try {
    if (isEditing.value) {
      // 저장 시점: 입력한 값(nickname.value)을 스토어 함수로 전달
      await authStore.updateUser(nickname.value, password.value);
      alert('수정 완료!');
    } else {
      // 수정 모드 진입 시점: 혹시 몰라서 현재 스토어 값으로 다시 동기화
      nickname.value = authStore.currentUser.nickname;
      password.value = authStore.currentUser.password;
    }
    isEditing.value = !isEditing.value;
  } catch (error) {
    alert('수정 중 오류가 발생했습니다.');
  }
};

//뒤로가기
const goBack = () => {
  console.log('뒤로가기');
  router.push('/ledgers');
};

//로그아웃
const logout = () => {
  authStore.logout();
  router.push('/auth/login');
};
</script>

<style scoped>
/* 상단 프로필 카드 배경색 */
.profile-card {
  background: #ffb800;
  border-radius: 20px;
}

/* 아바타 원형 */
.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* 입력창 스타일 커스텀 */
.form-control {
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 0.95rem;
}

/* 통계 박스 스타일 */
.stat-box {
  border-radius: 16px;
  transition: transform 0.2s;
}
.stat-box:hover {
  transform: translateY(-3px);
}

/* 아이콘 폰트 설정 (Bootstrap Icons) */
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css');
</style>
