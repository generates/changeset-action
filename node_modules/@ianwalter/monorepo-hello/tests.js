const { test } = require('@ianwalter/bff')
const { greet, leave } = require('.')

test('greet', t => {
  t.expect(greet('Cecilia')).toBe('Hello Cecilia!')
})

test('leave', t => {
  t.expect(leave('John')).toBe('Farewell, John!')
})
