import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/home',
      component: () => import('@/views/HomePage/HomePage.vue'),
      children: [
        {
          path: ':pluginId/development',
          name: 'home-development',
          component: () => import('@/views/HomePage/views/DevelopmentView/DevelopmentView.vue'),
          meta: {
            tab: 'development'
          }
        },
        {
          path: ':pluginId/history',
          name: 'home-history',
          component: () => import('@/views/HomePage/views/HistoryView/HistoryView.vue'),
          meta: {
            tab: 'history'
          }
        },
        {
          path: ':pluginId/feedback',
          name: 'home-feedback',
          component: () => import('@/views/HomePage/views/FeedbackView/FeedbackView.vue'),
          meta: {
            tab: 'feedback'
          }
        },
        {
          path: ':pluginId/services',
          name: 'home-services',
          component: () => import('@/views/HomePage/views/ServicesView/ServicesView.vue'),
          meta: {
            tab: 'services'
          }
        },
        {
          path: ':pluginId/team',
          name: 'home-team',
          component: () => import('@/views/HomePage/views/TeamView/TeamView.vue'),
          meta: {
            tab: 'team'
          }
        }
      ]
    }
  ],
})

export default router
