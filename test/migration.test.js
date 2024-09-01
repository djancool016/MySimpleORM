const config = require('../config')
const {poolManager, runMigrations} = require('../src').init(config)
const {getAllTable} = require(`../src/${config.db_system}/truncator`)

const migrations = [
    {
        tableName: "roles",
        timestamp: true,
        columns: [
            {
                columnName: "id",
                dataType: "INT",
                nullable: false,
                autoIncrement: true
            },
            {
                columnName: "name",
                dataType: "VARCHAR(50)",
                nullable: false,
                unique: true
            },
            {
                columnName: "description",
                dataType: "VARCHAR(255)",
                nullable: true
            }
        ]
        
    },
    {
        tableName: "users",
        timestamp: true,
        columns: [
            {
                columnName: "id",
                dataType: "INT",
                nullable: false,
                autoIncrement: true,
            },
            {
                columnName: "roleId",
                dataType: "INT",
                nullable: true,
                references: {table:'roles', key:'id'}
            },
            {
                columnName: "username",
                dataType: "VARCHAR(100)",
                nullable: false,
                unique: true
            },
            {
                columnName: "email",
                dataType: "VARCHAR(255)",
                nullable: false
            },
            {
                columnName: "password",
                dataType: "VARCHAR(255)",
                nullable: false
            },
            {
                columnName: "name",
                dataType: "VARCHAR(50)",
                nullable: true
            },
            {
                columnName: "phone",
                dataType: "VARCHAR(50)",
                nullable: true
            },
            {
                columnName: "address",
                dataType: "VARCHAR(100)",
                nullable: true
            },
            {
                columnName: "nik",
                dataType: "VARCHAR(30)",
                nullable: true
            },
            {
                columnName: "status",
                dataType: "ENUM('active', 'inactive', 'suspended')",
                nullable: false,
                default: "'active'"
            }
        ]
    }
]

describe('Test Migration', () => {

    let pool

    beforeAll(async() => {   
        pool = poolManager.connect()
    })

    test('Start test migration', async() => {

        await runMigrations(migrations, pool)

        const tables = await getAllTable(pool)  
        expect(tables).toBeTruthy()
    })

    afterAll(async()=>{
        await pool.end()
    })
})