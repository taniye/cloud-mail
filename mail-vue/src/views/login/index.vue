<template>
  <main class="login-page">
    <form class="login-form" @submit.prevent="submit">
      <label for="email">{{ isZh ? '地址' : 'Email address' }}</label>
      <el-input id="email" v-model="form.email" type="email" autocomplete="username"
                :placeholder="'admin@relaydot.com'" :aria-label="isZh ? '地址' : 'Email address'" required />
      <label for="password">{{ isZh ? '密码' : 'Password' }}</label>
      <el-input id="password" v-model="form.password" type="password" autocomplete="current-password"
                :aria-label="isZh ? '密码' : 'Password'" required />
      <el-button native-type="submit" type="primary" :loading="loading">{{ isZh ? '登录' : 'Sign in' }}</el-button>
    </form>
  </main>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import router from '@/router';
import { login } from '@/request/login.js';
import { loginUserInfo } from '@/request/my.js';
import { useSettingStore } from '@/store/setting.js';
import { useUserStore } from '@/store/user.js';
import { useAccountStore } from '@/store/account.js';
import { permsToRouter } from '@/perm/perm.js';
import { isEmail } from '@/utils/verify-utils.js';

const settingStore = useSettingStore();
const userStore = useUserStore();
const accountStore = useAccountStore();
const { t } = useI18n();
const isZh = computed(() => settingStore.lang === 'zh');
const form = reactive({ email: '', password: '' });
const loading = ref(false);

async function submit() {
  if (loading.value) return;
  const email = form.email.trim();
  if (!isEmail(email)) return ElMessage.error(t('notEmailMsg'));
  if (!form.password) return ElMessage.error(t('emptyPwdMsg'));
  loading.value = true;
  try {
    const data = await login(email, form.password);
    localStorage.setItem('token', data.token);
    const user = await loginUserInfo();
    accountStore.currentAccountId = user.account.accountId;
    accountStore.currentAccount = user.account;
    userStore.user = user;
    permsToRouter(user.permKeys).forEach(route => router.addRoute('layout', route));
    await router.replace({ name: 'layout' });
  } catch {
    // The shared HTTP client displays the server or connection error.
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page { display: grid; place-items: center; min-height: 100svh; padding: 32px 24px; background: var(--el-bg-color); }
.login-form { display: flex; flex-direction: column; width: min(100%, 320px); }
label { margin-bottom: 8px; font-size: 14px; color: var(--el-text-color-primary); }
.el-input { margin-bottom: 24px; height: 46px; }
.el-button { width: 100%; min-height: 46px; margin-top: 8px; }
:deep(.el-input__wrapper) { border-radius: 6px; }
:deep(.el-input__wrapper.is-focus) { box-shadow: 0 0 0 2px var(--el-color-primary) inset; }
.el-button:focus-visible { outline: 2px solid var(--el-color-primary); outline-offset: 4px; }
</style>
