import { createRouter, createWebHistory } from 'vue-router'
// import Home from '../views/Home.vue'
// import Parent from '../views/shares/Parent.vue'

const routes = [
  { path: '/', name: 'Home', component: () => import('../components/V2GeoConstruction3D.vue') },



]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router;