/**
 * useTheme - 主题管理系统
 *
 * @description
 * 提供主题切换与系统主题跟随功能，支持浅色/深色/自动三种模式。
 * - useTheme(): 初始化主题系统，监听系统主题变化
 * - useCurrentTheme(): 获取响应式当前主题 ref（推荐）
 * - setCurrentTheme(): 手动设置主题
 * - getCurrentTheme(): 同步获取当前主题值（非响应式）
 *
 * @author AI Assistant
 * @since 2026-01-19
 */

import { ref } from 'vue'

const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')

/**
 * 主题类型枚举
 */
type themeType = 'default' | 'dark' | 'auto'

/**
 * useTheme 初始化选项
 */
export interface UseThemeOptions {
  /** 设置浅色主题回调 */
  setDefaultTheme: () => void
  /** 设置深色主题回调 */
  setDarkTheme: () => void
  /** 获取用户配置（可选） */
  getUserThemeConfig?: () => themeType
}

/**
 * 当前主题状态（内部 ref）
 * 用于响应式主题跟踪
 */
const currentTheme = ref<themeType>('default')

/**
 * 初始化主题系统
 *
 * @description
 * 监听系统主题变化，优先使用用户配置。
 * 需要在应用启动时调用一次（通常在 main.ts 中）。
 *
 * @param options - 主题配置选项
 * @returns { themeRefresh } - themeRefresh 用于手动刷新主题
 *
 * @example
 * const { themeRefresh } = useTheme({
 *   setDefaultTheme: () => {
 *     document.documentElement.classList.remove('dark')
 *   },
 *   setDarkTheme: () => {
 *     document.documentElement.classList.add('dark')
 *   },
 *   getUserThemeConfig: () => {
 *     return localStorage.getItem('theme') as themeType || 'auto'
 *   }
 * })
 */
export function useTheme(options: UseThemeOptions) {
  /**
   * 处理主题变化事件
   */
  function mediaQueryListChange(event: MediaQueryListEvent) {
    // 优先检查用户配置
    if (options.getUserThemeConfig) {
      const userConfig = options.getUserThemeConfig()
      if (userConfig !== 'auto') {
        if (userConfig === 'dark') {
          options.setDarkTheme()
          currentTheme.value = 'dark'
        } else if (userConfig === 'default') {
          options.setDefaultTheme()
          currentTheme.value = 'default'
        }
        return
      }
    }

    // 跟随系统主题
    if (event.matches) {
      options.setDarkTheme()
      currentTheme.value = 'dark'
    } else {
      options.setDefaultTheme()
      currentTheme.value = 'default'
    }
  }

  /**
   * 加载主题监听
   */
  function themeLoad() {
    mediaQueryList.addEventListener('change', mediaQueryListChange)
    // 手动触发一次 change 事件以应用初始主题
    mediaQueryList.dispatchEvent(new MediaQueryListEvent('change', mediaQueryList))
  }

  /**
   * 手动刷新主题
   *
   * @description
   * 重新触发主题检测，用于主题配置变更后刷新。
   */
  function themeRefresh() {
    mediaQueryList.dispatchEvent(new MediaQueryListEvent('change', mediaQueryList))
  }

  themeLoad()
  console.log('mediaQueryList', mediaQueryList)

  return {
    themeRefresh
  }
}

/**
 * 手动设置主题
 *
 * @param theme - 目标主题（'default' | 'dark'）
 *
 * @example
 * setCurrentTheme('dark')  // 强制深色模式
 */
export function setCurrentTheme(theme: 'default' | 'dark') {
  mediaQueryList.dispatchEvent(new MediaQueryListEvent('change', {
    matches: theme === 'dark',
    media: '(prefers-color-scheme: dark)'
  }))
}

/**
 * 同步获取当前主题值（非响应式）
 *
 * @description
 * 直接返回当前主题值，不创建响应式依赖。
 * 适用于非 Vue 组件环境或不需要响应式的场景。
 * 在 Vue 组件中推荐使用 useCurrentTheme() 获取响应式 ref。
 *
 * @returns 当前主题 ('default' | 'dark')
 *
 * @example
 * const theme = getCurrentTheme() // 'dark'
 */
export function getCurrentTheme() {
  return currentTheme.value
}

/**
 * 获取响应式当前主题 ref（推荐）
 *
 * @description
 * 返回响应式的当前主题 ref，主题变化时自动更新依赖此 ref 的计算属性和模板。
 * 这是获取当前主题的推荐方式。
 *
 * @returns Ref<themeType> - 响应式主题引用
 *
 * @example
 * // 在组件中使用
 * const theme = useCurrentTheme()
 * const isDark = computed(() => theme.value === 'dark')
 *
 * @example
 * // 在模板中使用
 * <template>
 *   <div :class="{ dark: theme === 'dark' }">
 *     当前主题: {{ theme }}
 *   </div>
 * </template>
 */
export function useCurrentTheme() {
  return currentTheme
}
