const Migration = require('../src/migration')
const Database = require('../src/database')
const config = require('../config')

const roleMigration = {
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
    
}

const userMigration = {
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

describe('Test Migration', () => {

    let database

    beforeAll(async () => {
        const {db, pool} = Database.init(config)
        database = await db.connect()

    })

    test('Start test migration', async() => {

        await Migration.migrate({
            migrations: {
                roles: roleMigration,
                users: userMigration
            }, 
            db: database, 
            db_system: 'postgres'
        })
    })

    afterAll(async () => {
        await database.end()
    })
})