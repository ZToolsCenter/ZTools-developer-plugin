import { describe, expect, it } from 'vitest'
import {
  buildDevProjectsOrderPayload,
  movePluginToTop,
  reorderPluginsByIds
} from '../DevPluginSidebar'
import type { HomePlugin } from '@/views/HomePage/HomePage'

const basePlugins: HomePlugin[] = [
  {
    id: 'alpha',
    name: 'alpha',
    title: 'Alpha',
    version: '1.0.0',
    description: '',
    author: '',
    homepage: '',
    logo: '',
    path: null,
    configPath: null,
    localStatus: 'ready',
    lastValidatedAt: null,
    lastError: null,
    isRunning: false,
    isDevModeInstalled: false
  },
  {
    id: 'beta',
    name: 'beta',
    title: 'Beta',
    version: '1.0.0',
    description: '',
    author: '',
    homepage: '',
    logo: '',
    path: null,
    configPath: null,
    localStatus: 'ready',
    lastValidatedAt: null,
    lastError: null,
    isRunning: false,
    isDevModeInstalled: false
  },
  {
    id: 'gamma',
    name: 'gamma',
    title: 'Gamma',
    version: '1.0.0',
    description: '',
    author: '',
    homepage: '',
    logo: '',
    path: null,
    configPath: null,
    localStatus: 'ready',
    lastValidatedAt: null,
    lastError: null,
    isRunning: false,
    isDevModeInstalled: false
  }
]

describe('DevPluginSidebar logic', () => {
  it('moves a plugin to the first position', () => {
    expect(movePluginToTop(basePlugins, 'gamma').map((item) => item.id)).toEqual([
      'gamma',
      'alpha',
      'beta'
    ])
  })

  it('builds a complete order payload from the current list', () => {
    expect(buildDevProjectsOrderPayload(basePlugins)).toEqual(['alpha', 'beta', 'gamma'])
  })

  it('reorders the full list from a drag result', () => {
    expect(reorderPluginsByIds(basePlugins, ['beta', 'alpha', 'gamma']).map((item) => item.id)).toEqual([
      'beta',
      'alpha',
      'gamma'
    ])
  })
})
