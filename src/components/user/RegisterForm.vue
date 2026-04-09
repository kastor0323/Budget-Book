<template>
  <div
    class="container-fluid min-vh-100 d-flex align-items-center justify-content-center signup-bg"
  >
    <div class="card signup-card shadow border-0 p-4 p-md-5">
      <!-- 뒤로가기 -->
      <div class="mb-3">
        <span class="back-btn" @click="goLogin"> ← 로그인으로 돌아가기 </span>
      </div>

      <!-- 아이콘 -->
      <div class="text-center mb-3">
        <div class="icon-box">👤+</div>
      </div>

      <!-- 제목 -->
      <div class="text-center mb-4">
        <h2 class="fw-bold">회원가입</h2>
        <p class="text-muted small">KB Budget Book에 오신 것을 환영합니다</p>
      </div>

      <!-- 이메일 -->
      <div class="mb-3">
        <label class="form-label fw-semibold">이메일</label>
        <input
          v-model="email"
          type="email"
          class="form-control form-control-lg"
          placeholder="example@email.com"
        />
        <div :class="emailClass" class="small mt-1 fw-bold">
          {{ emailMessage }}
        </div>
      </div>

      <!-- 닉네임 -->
      <div class="mb-3">
        <label class="form-label fw-semibold">닉네임</label>
        <input
          v-model="nickname"
          type="text"
          class="form-control form-control-lg"
          placeholder="닉네임 입력"
        />
      </div>

      <!-- 비밀번호 -->
      <div class="mb-3">
        <label class="form-label fw-semibold">비밀번호</label>
        <input
          v-model="password"
          type="password"
          class="form-control form-control-lg"
        />
      </div>

      <!-- 비밀번호 확인 -->
      <div class="mb-3">
        <label class="form-label fw-semibold">비밀번호 확인</label>
        <input
          v-model="confirmPassword"
          type="password"
          class="form-control form-control-lg"
        />
        <div :class="messageClass" class="small mt-1 fw-bold">
          {{ message }}
        </div>
      </div>

      <!-- 버튼 -->
      <button
        class="btn btn-warning btn-lg w-100 fw-bold mt-3 shadow-sm"
        @click="signup"
      >
        👤 회원가입
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

const nickname = ref('');

const password = ref('');
const confirmPassword = ref('');

const email = ref('');
const emailMessage = ref('');
const emailClass = ref('');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//이메일 중복 확인
watch(email, async (newEmail) => {
  if (!newEmail) {
    emailMessage.value = '';
    emailClass.value = '';
    return;
  }
  if (!emailRegex.test(newEmail)) {
    emailMessage.value = '올바른 이메일 형식이 아닙니다.';
    emailClass.value = 'text-danger';
    return;
  }
  try {
    const res = await axios.get(
      `http://localhost:3000/users?email=${newEmail}`,
    );
    if (res.data.length > 0) {
      // 이미 존재
      emailMessage.value = '사용중인 이메일입니다.';
      emailClass.value = 'text-danger';
    } else {
      // 사용 가능
      emailMessage.value = '사용 가능한 이메일입니다.';
      emailClass.value = 'text-success';
    }
  } catch (err) {
    emailMessage.value = '서버 오류';
    emailClass.value = 'text-warning';
  }
});

// 회원가입
const signup = async () => {
  if (!email.value || !nickname.value || !password.value) {
    alert('모든 값을 입력하세요');
    return;
  }
  if (!emailValid.value) {
    alert('이메일 중복 확인을 해주세요');
    return;
  }
  if (password.value !== confirmPassword.value) {
    alert('비밀번호가 일치하지 않습니다');
    return;
  }
  await axios.post('http://localhost:3000/users', {
    email: email.value,
    nickname: nickname.value,
    password: password.value,
  });

  alert('회원가입 완료');
  router.push('/auth/login');
};
//뒤로 가기
const goLogin = () => {
  // 경로('/') 또는 이름({ name: 'Login' })으로 이동
  router.push('/auth/login');
};
// 비밀번호 확인
const message = computed(() => {
  if (!confirmPassword.value) return '';
  return password.value === confirmPassword.value
    ? '비밀번호가 일치합니다.'
    : '비밀번호가 일치하지 않습니다.';
});
// 색상 클래스
const messageClass = computed(() => {
  if (!confirmPassword.value) return '';
  return password.value === confirmPassword.value
    ? 'text-success'
    : 'text-danger';
});
</script>

<style scoped>
/* 배경 (KB 느낌) */
.signup-bg {
  background: linear-gradient(180deg, #ffd338 0%, #ffb800 100%);
}

/* 카드 */
.signup-card {
  width: 100%;
  max-width: 720px; /* PC 최대 크기 */
  min-width: 320px; /* 모바일 최소 */
  border-radius: 20px;
}

/* 아이콘 */
.icon-box {
  width: 70px;
  height: 70px;
  background: #fff3cd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  margin: 0 auto;
}

/* 뒤로가기 */
.back-btn {
  cursor: pointer;
  font-size: 14px;
  color: #555;
}

.back-btn:hover {
  text-decoration: underline;
}

/* 🔥 반응형 핵심 */
@media (max-width: 768px) {
  .signup-card {
    padding: 20px;
    border-radius: 12px;
  }
}

@media (min-width: 1200px) {
  .signup-card {
    max-width: 800px; /* 큰 모니터에서 더 크게 */
  }
}
</style>
