import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "不一样的少年~",
  base: '/blog/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '浏览器工作原理', link: '/docs/font/HowBrowsersWork/history' },
    ],

    sidebar: {
      '/': [
        {
          text: '浏览器工作原理',
          items: [
            { text: '浏览器视角:页面是如何从 0 到 1 加载的', link: '/docs/font/HowBrowsersWork/pageLoading' },
          ]
        }
      ],
      '/docs/font/HowBrowsersWork': [
        {
          text: '浏览器工作原理',
          items: [
            { text: '浏览器进化史', link: '/docs/font/HowBrowsersWork/history' },
            { text: '浏览器视角:页面是如何从 0 到 1 加载的', link: '/docs/font/HowBrowsersWork/pageLoading' },
            { text: '浏览器中的js执行机制', link: '/docs/font/HowBrowsersWork/JsExecutionMechanism' },
            { text: 'v8工作原理', link: '/docs/font/HowBrowsersWork/v8' },
            { text: '消息队列和事件循环', link: '/docs/font/HowBrowsersWork/eventQuene' },
            {
              text: '分层和合成机制', link: '/docs/font/HowBrowsersWork/layeredComposition'
            },
            { text: 'Chrome开发者工具', link: '/docs/font/HowBrowsersWork/chromeDeveloperTools' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
