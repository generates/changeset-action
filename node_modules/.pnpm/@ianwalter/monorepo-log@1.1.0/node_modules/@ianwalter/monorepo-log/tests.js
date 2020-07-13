const { test } = require('@ianwalter/bff')
const log = require('.')

test('log', t => {
  t.expect(log('Hello')).toContain('👋  Hello')
})
