import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { defineRule } from 'vee-validate';
import { required, email, min, max, alpha_num } from '@vee-validate/rules';

defineRule('required', required);
defineRule('email', email);
defineRule('min', min);
defineRule('max', max);
defineRule('alpha_num', alpha_num);

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
