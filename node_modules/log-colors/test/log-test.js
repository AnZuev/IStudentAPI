var logger = require('../index')
describe('Console logging with colors', function () {
  it('should log with colors', function () {
    console.log()
    logger.debug('if you see colors this test passs, if not it fails', {
      foo: 'bar'
    })
  })
})
