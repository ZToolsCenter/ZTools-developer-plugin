import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const sidebarSource = readFileSync(
  '/Users/xiaou/code/ztools/ZTools-developer-plugin/src/views/HomePage/components/DevPluginSidebar/DevPluginSidebar.vue',
  'utf-8'
)

describe('DevPluginSidebar styles', () => {
  it('keeps plugin names on a single truncated line inside the sidebar item', () => {
    const sidebarItemBlock = sidebarSource.match(/\.sidebar__item\s*\{[^}]*\}/)
    const sidebarItemTextBlock = sidebarSource.match(/\.sidebar__item-text\s*\{[^}]*\}/)

    expect(sidebarItemBlock?.[0]).toContain('min-width: 0;')
    expect(sidebarItemTextBlock?.[0]).toContain('overflow: hidden;')
    expect(sidebarItemTextBlock?.[0]).toContain('text-overflow: ellipsis;')
    expect(sidebarItemTextBlock?.[0]).toContain('white-space: nowrap;')
  })
})
