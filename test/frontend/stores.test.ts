/**
 * Store 测试
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useUserStore } from '../../frontend/src/stores/userStore'
import { useAppStore } from '../../frontend/src/stores/appStore'
import type { LoginResponse } from '../../frontend/src/types'

describe('userStore', () => {
  beforeEach(() => {
    useUserStore.getState().logout()
  })

  it('初始状态应为未登录', () => {
    const state = useUserStore.getState()
    expect(state.isLoggedIn).toBe(false)
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
  })

  it('setLogin 应设置用户信息和 token', () => {
    const loginData: LoginResponse = {
      token: 'test-jwt-token',
      userId: 1,
      username: 'testuser',
      jobRole: 'rd',
      role: 'user',
      level: 1,
      points: 0,
    }
    useUserStore.getState().setLogin(loginData)

    const state = useUserStore.getState()
    expect(state.isLoggedIn).toBe(true)
    expect(state.token).toBe('test-jwt-token')
    expect(state.user?.username).toBe('testuser')
    expect(state.user?.jobRole).toBe('rd')
  })

  it('logout 应清除所有状态', () => {
    const loginData: LoginResponse = {
      token: 'test-jwt-token', userId: 1, username: 'testuser',
      jobRole: 'rd', role: 'user', level: 1, points: 0,
    }
    useUserStore.getState().setLogin(loginData)
    expect(useUserStore.getState().isLoggedIn).toBe(true)

    useUserStore.getState().logout()
    expect(useUserStore.getState().isLoggedIn).toBe(false)
    expect(useUserStore.getState().user).toBeNull()
    expect(useUserStore.getState().token).toBeNull()
  })

  it('setUser 应更新用户信息', () => {
    const loginData: LoginResponse = {
      token: 'test-jwt-token', userId: 1, username: 'testuser',
      jobRole: 'rd', role: 'user', level: 1, points: 0,
    }
    useUserStore.getState().setLogin(loginData)

    useUserStore.getState().setUser({
      ...useUserStore.getState().user!,
      email: 'updated@test.com',
      points: 100,
    })

    expect(useUserStore.getState().user?.email).toBe('updated@test.com')
    expect(useUserStore.getState().user?.points).toBe(100)
  })
})

describe('appStore', () => {
  it('默认岗位应为 all', () => {
    useAppStore.setState({ currentJobRole: 'all' })
    expect(useAppStore.getState().currentJobRole).toBe('all')
  })

  it('应能切换岗位', () => {
    useAppStore.getState().setCurrentJobRole('rd')
    expect(useAppStore.getState().currentJobRole).toBe('rd')

    useAppStore.getState().setCurrentJobRole('pm_ops')
    expect(useAppStore.getState().currentJobRole).toBe('pm_ops')
  })
})
