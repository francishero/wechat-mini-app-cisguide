import Vue from 'vue'
import App from './App'
import Bmob from '../static/bmob/Bmob-1.4.4.min'
Bmob.initialize('','')

Vue.config.productionTip = false
App.mpType = 'app'

const app = new Vue(App)
app.$mount()

export default {

  config: {
    pages: ['pages/center/main', 'pages/detail/main', 'pages/index/main', 'pages/blog/main', 'pages/feedback/main', 'pages/collect/main', 'pages/new/main', '^pages/homepage/main'],
    window: {
        backgroundTextStyle: 'light',
        navigationBarBackgroundColor: '#5F9EA0',
        navigationBarTitleText: 'CisGuide',
        navigationBarTextStyle: '#fff'
    },
    tabBar: {
      color: '#999',
      selectedColor: '#d22222',
      borderStyle: 'black',
      list: [{
          pagePath: 'pages/homepage/main',
          text: 'Home',
          iconPath: 'static/assets/index1.png',
          selectedIconPath: 'static/assets/index.png'
      }, {
          pagePath: 'pages/blog/main',
          text: 'Articles',
          iconPath: 'static/assets/news.png',
          selectedIconPath: 'static/assets/news-active.png'

      }, {
          pagePath: 'pages/center/main',
          text: 'Me',
          iconPath: 'static/assets/center.png',
          selectedIconPath: 'static/assets/center-active.png'
      }]
    }

  }
}
