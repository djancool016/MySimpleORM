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
        timestamp: false,
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

describe('testing new QueryBuilder', ()=>{
    const includesObj = {
        register: ['description:register'],
        coa: ['description:coa'],
        account: ['description:account']
    }
    const model = modelMapper('entry', migrations, includesObj)
    
    const query = queryBuilder(model)

    test('test CREATE query', () => {
        const requestBody =  {
            id: 1,
            register_id: 1,
            coa_code: 1010,
            dc: 0
          }
        const result = query.create(requestBody)
        console.log(result)
        expect(result).toBeDefined()
    })
    test('test FindByPk query', () => {
        const requestBody = {id: 1}
        const result = query.read(requestBody)
        console.log(result)
        expect(result).toBeDefined()
    })
})