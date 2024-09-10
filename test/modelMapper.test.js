const config = require('../config')
const {builder: {queryBuilder}, modelMapper} = require('../src').init(config)
const {bookkeepingMigrations: migrations} = require('./dataSamples')

const includeColumns = {
    register: ['id:register_id'],
    entry: ['id:entry_id'],
    coa: ['code: coa_code'],
    account: ['id:account_id']
}

test('test modelMapper', () => {
    const result = modelMapper('transaction', migrations, includeColumns)
    const query = queryBuilder(result)
    console.log(JSON.stringify(result, null, 4))
    console.log(query.read({id: 1}))
    expect(result).toBeTruthy()
})
