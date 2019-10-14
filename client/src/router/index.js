/* eslint-disable */
import Vue from 'vue'
import Router from 'vue-router'
import Upload from '@/pages/Upload'
import LoadCurrentMonth from '@/pages/LoadCurrentMonth'
import MainPage from '@/pages/MainPage'
import ReportPage from '@/pages/ReportPage'
import NotFoundPage from '@/pages/NotFoundPage'
import PortalPage from '@/pages/PortalPage'

Vue.use(Router)

export default new Router({
  mode: 'history',
//  base: '/dist/',
  routes: [
    {
      path: '/',
      name: 'LoadCurrentMonth',
      component: LoadCurrentMonth
    },
    {
      path: '/portal',
      name: 'PortalPage',
      component: PortalPage
    },
    {
      path: '/:pod/:year/:month',
      name: 'MainPage',
      component: MainPage
    },
    {
      path: '/:pod/:year/:month/report',
      name: 'ReportPage',
      component: ReportPage
    },
    {
      path: '/:pod/upload',
      name: 'Upload',
      component: Upload
    },
    {
      path:'*',
      name: 'NotFoundPage',
      component: NotFoundPage

    }
  ]
})
