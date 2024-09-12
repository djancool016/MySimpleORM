const config = require('../config')
const {poolManager, runTruncator, runMigrations, runSeeds, builder, UnitTestFramework, Model} = require('../src').init(config)
const pool = poolManager.connect()
const {migrations, seeds, userModel} = require('./dataSamples')

const testCases = {
    create: [
        {
            input: {
                role_id: 1,
                username: 'asdasdasd',
                password: 'asdasdasdas',
                email: 'email@gmail.com',
                name: 'DwiJ',
                phone: '+62123123123',
                address: 'Indonesia',
                nik: 'qweqweqweqwe'
            },
            description: 'Success should returning truthly'
        },
        {
            input: {
                id: 7654,
                role_id: 1,
                username: 'TestUser1',
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
                role_idX: 1,
                username: 'TestUser1',
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
    sum: [
        {
            input: {sum:['id']},
            output: {data: [{total_users_id: 'random string'}]},
            description: 'Success should return truthly'
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

const testModule = new Model(pool, userModel, builder)

const test = new UnitTestFramework(testCases, testModule)

test.setBeforeAll = async () => {
    await runMigrations(migrations, pool)
    await runTruncator(pool)
    await runSeeds(seeds, pool)
}

test.setAfterAll = async () => {
    await pool.end()
}
test.runTest()