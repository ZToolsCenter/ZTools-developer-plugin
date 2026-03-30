import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('developer plugin manifest', () => {
  it('declares cmds for every feature', () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), 'src-ztools/plugin.json'), 'utf-8')
    )

    for (const feature of manifest.features) {
      expect(Array.isArray(feature.cmds) && feature.cmds.length > 0).toBe(true)
    }
  })
})
