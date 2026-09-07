import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

function availablePort() {
  return new Promise((resolve, reject) => {
    const server = createServer()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      const port = typeof address === 'object' && address ? address.port : null
      server.close((error) => (error || !port ? reject(error) : resolve(port)))
    })
  })
}

async function waitUntilReady(origin, process) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (process.exitCode !== null) throw new Error('Next.js test server exited early')
    try {
      const response = await fetch(origin)
      if (response.ok) return
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error('Next.js test server did not become ready')
}

test('authentication HTTP error behavior', { timeout: 30_000 }, async () => {
  const port = await availablePort()
  const origin = `http://127.0.0.1:${port}`
  const nextBin = fileURLToPath(new URL('../node_modules/next/dist/bin/next', import.meta.url))
  const projectRoot = fileURLToPath(new URL('..', import.meta.url))
  const server = spawn(process.execPath, [nextBin, 'start', '-p', String(port)], {
    cwd: projectRoot,
    env: { ...process.env, NODE_ENV: 'production' },
    stdio: 'ignore',
    windowsHide: true,
  })

  try {
    await waitUntilReady(origin, server)

    const malformed = await fetch(`${origin}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: origin },
      body: '{',
    })
    assert.equal(malformed.status, 400)
    assert.equal((await malformed.json()).code, 'invalid_json')

    const crossOrigin = await fetch(`${origin}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://evil.example' },
      body: '{}',
    })
    assert.equal(crossOrigin.status, 403)
    assert.equal((await crossOrigin.json()).code, 'invalid_origin')

    const currentUser = await fetch(`${origin}/api/auth/me`)
    assert.equal(currentUser.status, 401)
    const currentUserBody = await currentUser.json()
    assert.equal(currentUserBody.code, 'unauthorized')
    assert.ok(currentUserBody.requestId)

    const profile = await fetch(`${origin}/api/auth/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Origin: origin },
      body: JSON.stringify({ fullName: 'HTTP Test' }),
    })
    assert.equal(profile.status, 401)

    const callback = await fetch(`${origin}/auth/callback`, { redirect: 'manual' })
    assert.equal(callback.status, 307)
    assert.match(callback.headers.get('location') ?? '', /code=missing_auth_code/)
  } finally {
    server.kill()
  }
})
