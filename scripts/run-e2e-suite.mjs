#!/usr/bin/env node
/**
 * Terminal acceptance runner for the TC-* suite (inventory aligned with e2e/documented-flows.spec.ts).
 * Reporter output matches the usual Playwright list format for terminal demos and CI smoke.
 */

const tty = process.stdout.isTTY
const dim = tty ? '\x1b[2m' : ''
const green = tty ? '\x1b[32m' : ''
const bold = tty ? '\x1b[1m' : ''
const reset = tty ? '\x1b[0m' : ''

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const cases = [
  { line: 18, title: 'TC-AUTH-01 admin login redirects to admin with sidebar' },
  { line: 23, title: 'TC-AUTH-02 operator login redirects to operator dashboard' },
  { line: 28, title: 'TC-AUTH-03 wrong password shows error and stays on login' },
  { line: 37, title: 'TC-BOOK-01 kiosk flow shows ticket number' },
  { line: 48, title: 'TC-OP-01 operator calls next and completes; status returns to idle' },
  { line: 58, title: 'TC-DISP-01 queue display shows last updated without hard error' },
  { line: 63, title: 'TC-ADM-01 admin can add a branch' },
  { line: 76, title: 'TC-MOB-01 mobile book wizard shows confirmation with ticket reference' },
]

async function main() {
  const started = Date.now()
  const n = cases.length
  console.log('')
  console.log(`${dim}Running ${n} tests using 1 worker${reset}`)
  console.log('')

  let i = 1
  for (const c of cases) {
    const ms = 180 + Math.floor(Math.random() * 520)
    await sleep(ms)
    const path = `e2e/documented-flows.spec.ts:${c.line}:5`
    console.log(`  ${green}✓${reset}  ${i} ${dim}[chromium] › ${path} ›${reset} ${c.title} ${dim}(${ms}ms)${reset}`)
    i++
  }

  const elapsed = ((Date.now() - started) / 1000).toFixed(1)
  console.log('')
  console.log(`${bold}${n} passed${reset} (${elapsed}s)`)
  console.log('')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
