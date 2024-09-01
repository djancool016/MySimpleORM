const config = require('../config')
const {poolManager, runTruncator} = require('../src').init(config)

describe('Testing database truncator', () => {

    let pool

    beforeAll(async() => {
        pool = poolManager.connect()
    })

    test('Test truncator function', async () => {
        await runTruncator(pool)
    })

    afterAll(async() => {
        pool.end()
    })
})


