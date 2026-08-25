import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import LoginPage from '~/pages/login.vue'

describe('LoginPage Component', () => {
  it('should render login card with title and input fields', async () => {
    const wrapper = await mountSuspended(LoginPage)

    expect(wrapper.text()).toContain('Masuk ke Akun')
    expect(wrapper.text()).toContain('Masukkan kredensial Anda')
    expect(wrapper.find('form').exists()).toBe(true)
  })
})
