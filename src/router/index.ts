import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/login', name: 'Login', component: () => import('@/views/Login.vue') },
        {
            path: '/',
            component: () => import('@/views/Layout.vue'),
            children: [
                { path: '', name: 'Home', component: () => import('@/views/Home.vue') }
            ]
        }
    ]
})

export default router