const config = require('../config')
const {
    poolManager, 
    runTruncator, 
    runMigrations, 
    runSeeds, 
    Model, 
    controller,
    builder,
    UnitTestFramework
} = require('../src').init(config)

const {migrations, seeds, userModel} = require('./dataSamples')

const pool = poolManager.connect()

const testCases = {
    create: [
        {
            input: {
                body: {
                    id: 7654,
                    role_id: 1,
                    username: 'TestUser1',
                    password: '1234',
                    email: 'email@gmail.com',
                    name: 'DwiJ',
                    phone: '+62123123123',
                    address: 'Indonesia',
                    nik: '1122334455'
                }
            },
            output: {httpCode: 201},
            description: 'Success should returning affectedRows = 1'
        },{
            input: {
                body: {
                    role_idX: 1,
                    username: 'TestUser1',
                    password: '1234',
                    email: 'email@gmail.com',
                    name: 'DwiJ',
                    phone: '+62123123123',
                    address: 'Indonesia',
                    nik: '1122334455'
                }
            },
            output: {httpCode: 400, code: 'ER_BAD_FIELD_ERROR'},
            description: 'Invalid keys should returning httpCode 400'
        },{
            input: {},
            output: {httpCode: 400, code: 'ER_INVALID_BODY'},
            description: 'Invalid body should returning httpCode 400'
        }
    ],
    read: [
        {
            input: {params:{id: 7654}},
            output: {httpCode: 200, data: [{id: 7654, username: 'TestUser1'}]},
            description: 'input params.id should run model.findByPk and returning array'
        },{
            input: {query:{id: [7654, 1]}},
            output: {httpCode: 200, data: [{id: 7654, username: 'TestUser1'},{id: 1}]},
            description: 'input query.id should run model.findByKeys and returning array'
        },{
            input: {body: {id: 1, name: 'Admin'}},
            output: {httpCode: 400, code: 'ER_GET_REFUSE_BODY'},
            description: 'input body.id should return error code ER_GET_REFUSE_BODY'
        },{
            input: {},
            output: {httpCode: 200, data: [{id: 7654, username: 'TestUser1'}]},
            description: 'input empty request object should run findAll'
        },{
            input: {query: {id: 99999}},
            output: {httpCode: 404, code: 'ER_NOT_FOUND'},
            description: 'Not found should returning httpCode 404'
        }
    ],
    update: [
        {
            input: {
                body: {id: 7654, name: 'JuliantDwyne'}
            },
            output: {httpCode: 200},
            description: 'Success should returning truthly'
        },{
            input: {
                body: {id: 7654, nameX: 'JuliantDwyne'}
            },
            output: {httpCode: 400, code: 'ER_BAD_FIELD_ERROR'},
            description: 'Invalid keys should returning httpCode 400'
        },{
            input: {},
            output: {httpCode: 400, code: 'ER_INVALID_BODY'},
            description: 'Invalid body should returning httpCode 400'
        }
    ],
    delete: [
        {
            input: {params: {id: 7654}},
            output: {httpCode: 200},
            description: 'Success should returning truthly'
        },{
            input: {params: {id: 9999}},
            output: {httpCode: 404, code: 'ER_NOT_FOUND'},
            description: 'Not found should returning httpCode 404'
        },{
            input: {},
            output: {httpCode: 400, code: 'ER_INVALID_BODY'},
            description: 'Invalid body should returning httpCode 400'
        }
    ]
}

const testModule = () => {
    const res = {}
    const next = (req) => () => req.result
    const model = new Model(pool, userModel, builder)

    const test = (method, req) => controller[method](req, res, next(req), model)

    return {
        create: (req) => test('create', req),
        read: (req) => test('read', req),
        update: (req) => test('update', req),
        delete: (req) => test('destroy', req)
    }
}

const test = new UnitTestFramework(testCases, testModule())

test.setBeforeAll = async () => {
    await runMigrations(migrations, pool)
    await runTruncator(pool)
    await runSeeds(seeds, pool)
}
test.setAfterAll = async () => {
    await pool.end()
}

test.runTest()