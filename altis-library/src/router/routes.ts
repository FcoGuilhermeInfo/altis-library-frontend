import type { RouteRecordRaw } from 'vue-router';
import { ROLES } from '@/constants/roles'

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: '/login',
  },

  {
    path: "/login",
    component: () => import('@/pages/LoginPage.vue'),
  },

  {
    path: "/register",
    component: () => import('@/pages/RegisterPage.vue'),
  },

  {
  path: '/forgot-password',
  component: () => import('@/pages/ForgotPasswordPage.vue'),
  },
  
  {
    path: '/reset-password',
    component: () => import('@/pages/ResetPasswordPage.vue')
  },
  
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: {
      requiresAuth: true,
    },
    children: [
      { 
        path: 'dashboard', 
        component: () => import('@/pages/IndexPage.vue') ,
        meta: {
        roles: [ROLES.ADMIN, ROLES.USER],
        },
    },

      {
        path: 'acess-denied',
        component: () => import('@/pages/AcessDeniedPage.vue'),
      },  
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
];



export default routes;
