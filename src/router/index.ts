import {createRouter, createWebHistory} from 'vue-router';
import register from '@/components/Account_Auth/Register.vue';
import FogotPassword from '@/components/Account_Auth/ForgotPassword.vue';

import LoginView from '@/views/LoginView.vue';
import HomeView from '@/views/HomeView.vue';
import ProfileView from '@/views/ProfileView.vue';
import CruiseDetailsView from '@/views/CruiseDetailsView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/FogotPassword',
            name: 'FogotPassword',
            component: FogotPassword
        },
        {
            path: '/home',
            name: 'home',
            component: HomeView
        },
        {
            path: '/profile',
            name: 'ProfileView',
            component: ProfileView
        },   {
            path: '/register',
            name: 'register',
            component: register
        },
        {
            path: '/LoginView',
            name: 'LoginView',
            component: LoginView
        }
        ,{
            path: '/CruiseDetailsView',
            name: 'CruiseDetailsView',
            component: CruiseDetailsView
        },
        {
            path: '/',
            name: 'HomeView',
            component: HomeView
        }

    ]
});

export default router;
