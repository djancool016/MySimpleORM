const config = require('../config')
const {poolManager, runTruncator, runMigrations, runSeeds} = require('../src').init(config)
const pool = poolManager.connect()
const builder = require('../src/utils/queryBuilder').init(config)
const UnitTestFramework = require('../src/utils/unitTestFramework')
const Model = require('../src/model')

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
const seeds = [
    {
        table: 'roles',
        seed: [
            {
                id: 1,
                name: "Admin",
                description: "Full access to system features."
            },
            {
                id: 2,
                name: "Manager",
                description: "Supervise loan operations."
            }
        ]
    },
    {
        table: 'users',
        seed: [
            {
                id: 1,
                roleId: 1,
                username: 'admin',
                password: '$2b$10$h6Uo0u07tzgVf14jTsIPHOskqDUdDwLsZeMFCxX5rm8BsEJTePZd.',
                email: 'admin@Email.com',
                name: 'Dwi Julianto',
                phone: '213546879213',
                address: 'Semarang, Indonesia',
                nik: '7722323656989'
            }
        ]
    }
]
const model = {
    table: 'users',
    includes: [
        'id','roleId','username', 'password','email', 
        'name', 'phone', 'address','nik', 'status'
    ],
    association: [
        {
            table: 'roles',
            references: 'roles.id',
            foreignKey: 'users.roleId',
            includes: ['name'],
            alias: {
                name: 'role'
            }
        }
    ]
}
const testCases = {
    create: [
        {
            input: {
                id: 7654,
                roleId: 1,
                userName: 'TestUser1',
                password: '1234',
                email: 'email@gmail.com',
                name: 'DwiJ',
                phone: '+62123123123',
                address: 'Indonesia',
                nik: '1122334455'
            },
            description: 'Success should returning truthly'
        },{
            input: {
                roleIdX: 1,
                userName: 'TestUser1',
                password: '1234',
                email: 'email@gmail.com',
                name: 'DwiJ',
                phone: '+62123123123',
                address: 'Indonesia',
                nik: '1122334455'
            },
            output: {code: 'ER_BAD_FIELD_ERROR'},
            description: 'Invalid input should throwing error code ER_BAD_FIELD_ERROR'
        },{
            input: undefined,
            output: {code: 'ER_INVALID_BODY'},
            description: 'Invalid input should throwing error code ER_INVALID_BODY'
        }
    ],
    findByPk: [
        {
            input: 7654,
            output: {data: [{id: 7654, username: 'TestUser1'}]},
            description: 'Success should returning array of objects'
        },{
            input: 999999,
            output: {code: 'ER_NOT_FOUND'},
            description: 'Empty result should throwing error code ER_NOT_FOUND'
        },{
            input: undefined,
            output: {code: 'ER_INVALID_BODY'},
            description: 'Invalid input should throwing error code ER_INVALID_BODY'
        }
    ],
    findAll: [
        {
            input: {},
            output: {data: [{id: 7654, username: 'TestUser1'}]},
            description: 'Success should returning array of objects'
        },{
            input: undefined,
            output: {code: 'ER_INVALID_BODY'},
            description: 'Invalid input should throwing error code ER_INVALID_BODY'
        }
    ],
    findByKeys: [
        {
            input: {id:7654, username: 'Tes'},
            output: {data:[{id: 7654}]},
            description: 'Success should returning array of objects'
        },{
            input: {id:1, username: 'adm', other: 'unknown key'},
            output: {code: 'ER_NOT_FOUND'},
            description: 'Empty result should throwing error code ER_NOT_FOUND'
        },{
            input: undefined,
            output: {code: 'ER_INVALID_BODY'},
            description: 'Invalid input should throwing error code ER_INVALID_BODY'
        }
    ],
    update: [
        {
            input: {id: 7654, name: 'JuliantDwyne'},
            description: 'Success should return truthly'
        },{
            input: {id: 7654, nameX: 'JuliantDwyne'},
            output: {code: 'ER_BAD_FIELD_ERROR'},
            description: 'Invalid input should throwing error code ER_BAD_FIELD_ERROR'
        },{
            input: undefined,
            output: {code: 'ER_INVALID_BODY'},
            description: 'Invalid input should throwing error code ER_INVALID_BODY'
        }
    ],
    delete: [
        {
            input: 7654,
            description: 'Success should return truthly'
        },{
            input: 9999,
            output: {code: 'ER_NOT_FOUND'},
            description: 'Empty result should throwing error code ER_NOT_FOUND'
        },{
            input: undefined,
            output: {code: 'ER_INVALID_BODY'},
            description: 'Invalid input should throwing error code ER_INVALID_BODY'
        }
    ]
}

const testModule = new Model(pool, model, builder)

const test = new UnitTestFramework(testCases, testModule)

test.setBeforeAll = async () => {
    await runTruncator(pool)
    await runMigrations(migrations, pool)
    await runSeeds(seeds, pool)
}

test.setAfterAll = async () => {
    await pool.end()
}
test.runTest()