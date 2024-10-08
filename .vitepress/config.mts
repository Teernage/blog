import { defineConfigWithTheme } from 'vitepress';
import escookConfig from '@escook/vitepress-theme/config';

export default defineConfigWithTheme({
  extends: escookConfig,
  title: '不一样的少年~',
  base: '/blog/',
  appearance: 'dark',
  head: [['link', { rel: 'icon', href: '/blog/img/icon.svg' }]],
  themeConfig: {
    musicBall: {
      src: '/blog/mp3/永远同在.mp3',
      autoplay: true,
      loop: true,
    },
    nav: [
      { text: '首页', link: '/' },
      { text: '浏览器工作原理', link: '/docs/font/HowBrowsersWork/history' },
    ],

    sidebar: {
      '/': [
        {
          text: '浏览器工作原理',
          items: [
            {
              text: '浏览器视角:页面是如何从 0 到 1 加载的',
              link: '/docs/font/HowBrowsersWork/pageLoading',
            },
          ],
        },
      ],
      '/docs/font/HowBrowsersWork': [
        {
          text: '浏览器工作原理',
          items: [
            {
              text: '浏览器进化史',
              link: '/docs/font/HowBrowsersWork/history',
            },
            {
              text: '浏览器视角:页面是如何从 0 到 1 加载的',
              link: '/docs/font/HowBrowsersWork/pageLoading',
            },
            { text: '网络', link: '/docs/font/HowBrowsersWork/newtWork' },
            {
              text: '浏览器缓存',
              link: '/docs/font/HowBrowsersWork/browserCache',
            },
            {
              text: '浏览器中的js执行机制',
              link: '/docs/font/HowBrowsersWork/JsExecutionMechanism',
            },
            { text: 'v8工作原理', link: '/docs/font/HowBrowsersWork/v8' },
            {
              text: '消息队列和事件循环',
              link: '/docs/font/HowBrowsersWork/eventQuene',
            },
            {
              text: '分层和合成机制',
              link: '/docs/font/HowBrowsersWork/layeredComposition',
            },
            {
              text: '浏览器渲染帧',
              link: '/docs/font/HowBrowsersWork/renderingFrames',
            },
            {
              text: '浏览器分配渲染进程的机制',
              link: '/docs/font/HowBrowsersWork/allocation',
            },
            {
              text: '页面性能优化',
              link: '/docs/font/HowBrowsersWork/performanceOptimization',
            },
            {
              text: 'Chrome开发者工具',
              link: '/docs/font/HowBrowsersWork/chromeDeveloperTools',
            },
            {
              text: '浏览器安全',
              link: '/docs/font/HowBrowsersWork/BrowserSecurity',
            },
          ],
        },
      ],
      '/docs/font/v8': [
        {
          text: 'v8引擎',
          items: [
            { text: '设计思想', link: '/docs/font/v8/designIdea' },
            { text: '编译流水线', link: '/docs/font/v8/compile' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
    ],
  },
});
