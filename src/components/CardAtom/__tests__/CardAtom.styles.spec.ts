import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const cardAtomSource = readFileSync(
  '/Users/xiaou/code/ztools/ZTools-developer-plugin/src/components/CardAtom/CardAtom.vue',
  'utf-8'
)

describe('CardAtom styles', () => {
  it('keeps the right status visible by allowing the left content to shrink', () => {
    const mainBlock = cardAtomSource.match(/\.card-atom__main\s*\{[^}]*\}/)
    const statusBlock = cardAtomSource.match(/\.card-atom__status\s*\{[^}]*\}/)

    expect(cardAtomSource).toContain('class="card-atom__main"')
    expect(mainBlock?.[0]).toContain('flex: 1;')
    expect(mainBlock?.[0]).toContain('min-width: 0;')
    expect(statusBlock?.[0]).toContain('min-width: 0;')
    expect(statusBlock?.[0]).toContain('overflow-wrap: anywhere;')
    expect(statusBlock?.[0]).toContain('text-align: right;')
  })
})
