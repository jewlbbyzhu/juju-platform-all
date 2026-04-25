import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { 
  accessGuard, 
  titleGuard, 
  loadingGuard, 
  progressGuard,
  errorGuard,
  afterEachGuard 
} from './guards'

// Import route modules
import authRoutes from './modules/auth'
import dashboardRoutes from './modules/dashboard'
import partyRoutes from './modules/party'
import orderRoutes from './modules/order'
import financeRoutes from './modules/finance'
import contentRoutes from './modules/content'
import analyticsRoutes from './modules/analytics'
import systemRoutes from './modules/system'
import appRoutes from './modules/app'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  ...authRoutes,
  ...dashboardRoutes,
  ...partyRoutes,
  ...orderRoutes,
  ...financeRoutes,
  ...contentRoutes,
  ...analyticsRoutes,
  ...systemRoutes,
  ...appRoutes,
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// Global navigation guards
router.beforeEach(progressGuard)
router.beforeEach(loadingGuard)
router.beforeEach(accessGuard)
router.beforeEach(titleGuard)

// Error handling
router.onError(errorGuard)

// After navigation
router.afterEach(afterEachGuard)

export default router