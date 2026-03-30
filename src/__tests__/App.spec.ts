import { describe, expect, it } from 'vitest'

import { mount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from '../App.vue'

describe('App', () => {
  it('renders the router shell', async () => {
    const router = createRouter({
      history: createWebHashHistory(),
      routes: [{ path: '/', component: { template: '<div>home shell</div>' } }]
    })

    await router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.text()).toContain('home shell')
  })
})
