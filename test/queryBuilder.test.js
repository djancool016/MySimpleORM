const config = require('../config')
const {builder: {queryBuilder}, modelMapper, UnitTestFramework} = require('../src').init(config)

const migrations = {
    account: {
        tableName: "account",
        timestamp: false,
        columns: [
            {
                columnName: "id",
                dataType: "INT",
                nullable: false,
                autoIncrement: true
            },
            {
                columnName: "description",
                dataType: "VARCHAR(255)",
                nullable: false
            }
        ]
    }
    ,
    coa: {
        tableName: "coa",
        timestamp: false,
        columns: [
            {
                columnName: "id",
                dataType: "INT",
                nullable: false,
                autoIncrement: true
            },
            {
                columnName: "account_id",
                dataType: "INT",
                nullable: false,
                references: {table: 'account', key:'id'}
            },
            {
                columnName: 'code',
                dataType: 'INT',
                nullable: false,
                unique: true
            },
            {
                columnName: "base_value",
                dataType: "INT",
                nullable: false
            },
            {
                columnName: "description",
                dataType: "VARCHAR(255)",
                nullable: false
            }
        ]
    },
    register: {
        tableName: "register",
        timestamp: false,
        columns: [
            {
                columnName: "id",
                dataType: "INT",
                nullable: false,
                autoIncrement: true
            },
            {
                columnName: "description",
                dataType: "VARCHAR(255)",
                nullable: false
            }
        ]
    }
    ,
    entry: {
        tableName: "entry",
        timestamp: true,
        columns: [
            {
                columnName: "id",
                dataType: "INT",
                nullable: false,
                autoIncrement: true
            },
            {
                columnName: "register_id",
                dataType: "INT",
                nullable: false,
                references: {table:'register', key:'id'}
            },
            {
                columnName: "coa_code",
                dataType: "INT",
                nullable: false,
                references: {table: 'coa', key: 'code'}
            },
            {
                columnName: "dc",
                dataType: "INT",
                nullable: false
            }
        ]
    }
}

const testCases = {
    create: [
        {
            input: {id: 1, register_id: 1, coa_code: 1010, dc: 0},
            output: 'contain: INSERT INTO entry (id, register_id, coa_code, dc)',
            description: 'Create Query'
        }
    ],
    read: [
        {
            input: {id: 1},
            output: 'contain: WHERE entry.id = $1',
            description: 'Read Params Id Query'
        },
        {
            input: {id: [1,2,3,4,5]},
            output: 'contain: WHERE entry.id IN ($1, $2, $3, $4, $5)',
            description: 'Read Params array of id Object Query'
        },
        {
            input: {id: "1,2,3,4,5"},
            output: 'contain: WHERE entry.id IN ($1, $2, $3, $4, $5)',
            description: 'Read Params string separated by coma Object Query'
        },
        {
            input: {id: 1, coa_code: 1010},
            output: 'contain: WHERE entry.id = $1 AND entry.coa_code = $2',
            description: 'Read By Object Query'
        },
        {
            input: {updated_at_start: "2024-10-01", updated_at_end: "2024-10-30"},
            output: 'contain: WHERE entry.updated_at >= $1 AND entry.updated_at <= $2',
            description: 'Read By Date Range Query'
        },
        {
            input: {coa_code_start: 1010, coa_code_end: 6010},
            output: 'contain: WHERE entry.coa_code >= $1 AND entry.coa_code <= $2',
            description: 'Read By Range Rumbers Query'
        },
        {
            input: {id_start: 1, id_end: 99999, page: 2, page_size: 100},
            output: 'contain WHERE entry.id >= $1 AND entry.id <= $2 ORDER BY id ASC LIMIT 100 OFFSET 100',
            description: 'Read By Range Rumbers Query'
        }
    ]
}

const includesObj = {
    register: ['description:register'],
    coa: ['description:coa'],
    account: ['description:account']
}
const model = modelMapper('entry', migrations, includesObj)
console.log(model)
const testModule = queryBuilder(model)

const test = new UnitTestFramework(testCases, testModule, true)

test.runTest()