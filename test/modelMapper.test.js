const config = require('../config')
const {builder: {queryBuilder}, modelMapper} = require('../src').init(config)

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
                columnName: "accountId",
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
                columnName: "baseValue",
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
        timestamp: false,
        columns: [
            {
                columnName: "id",
                dataType: "INT",
                nullable: false,
                autoIncrement: true
            },
            {
                columnName: "registerId",
                dataType: "INT",
                nullable: false,
                references: {table:'register', key:'id'}
            },
            {
                columnName: "coaCode",
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

const includesObj = {
    register: ['description:register'],
    coa: ['description:coa'],
    account: ['description:account']
}

test('test modelMapper', () => {
    const result = modelMapper('entry', migrations, includesObj)
    const query = queryBuilder(result)
    console.log(JSON.stringify(result, null, 4))
    console.log(query.read({id: 1}))
    expect(result).toBeTruthy()
})
