const config = require('../config')
const {builder: {queryBuilder}, modelMapper, UnitTestFramework} = require('../src').init(config)
const {bookkeepingMigrations: migrations, transactionModel} = require('./dataSamples')

const testCases = {
    create: [
        {
            input: {id: 1, register_id: 1, amount: 15000000, date: "2024-10-01", description: 'Setoran Kas'},
            output: 'contain: INSERT INTO transaction (id, register_id, amount, date, description)',
            description: 'Create Query'
        }
    ],
    read: [
        {
            input: {id: 1},
            output: 'contain: WHERE transaction.id = $1',
            description: 'Read Params Id Query'
        },
        {
            input: {id: [1,2,3,4,5]},
            output: 'contain: WHERE transaction.id IN ($1, $2, $3, $4, $5)',
            description: 'Read Params array of id Object Query'
        },
        {
            input: {id: "1,2,3,4,5"},
            output: 'contain: WHERE transaction.id IN ($1, $2, $3, $4, $5)',
            description: 'Read Params string separated by coma Object Query'
        },
        {
            input: {id: 1, register_id: 1},
            output: 'contain: WHERE transaction.id = $1 AND transaction.register_id = $2',
            description: 'Read By Object Query'
        },
        {
            input: {updated_at_start: "2024-10-01", updated_at_end: "2024-10-30"},
            output: 'contain: WHERE transaction.updated_at >= $1 AND transaction.updated_at <= $2',
            description: 'Read By Date Range Query'
        },
        {
            input: {register_id_start: 1, register_id_end: 10},
            output: 'contain: WHERE transaction.register_id >= $1 AND transaction.register_id <= $2',
            description: 'Read By Range Rumbers Query'
        },
        {
            input: {id_start: 1, id_end: 99999, page: 2, page_size: 100},
            output: 'contain: WHERE transaction.id >= $1 AND transaction.id <= $2 ORDER BY id ASC LIMIT 100 OFFSET 100',
            description: 'Read By Range Rumbers Query'
        },
        {
            input: {register: 'Register Description'},
            output: 'contain: WHERE register.description = $1',
            description: 'Read By foreign table register'
        },
        {
            input: {coa_code: 1010},
            output: 'contain: WHERE entry.coa_code = $1',
            description: 'Read By foreign table register'
        }
    ],
    sum: [
        {
            input: {sum:['amount']},
            output: 'contain: SELECT SUM(transaction.amount) AS total_transaction_amount',
            description: 'Create SUM Query'
        },
        {
            input: {sum:['amount', 'coa_code'], date_start: "2024-10-01", date_end: "2024-10-30"},
            output: 'contain: SELECT SUM(transaction.amount) AS total_transaction_amount, SUM(entry.coa_code) AS total_entry_coa_code',
            description: 'Create SUM Query'
        }
    ],
}

const includesObj = {
    register: ['description:register'],
    entry: ['id:entry_id', 'coa_code:coa_code', 'dc:dc'],
    coa: ['code: coa_code'],
    account: ['id:account_id']
}
const model = modelMapper('transaction', migrations, includesObj)
console.log(JSON.stringify(model,null,4))
const testModule = queryBuilder(model)

const test = new UnitTestFramework(testCases, testModule, true)

test.runTest()