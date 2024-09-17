const config = require('../config')
const {helperUtils, UnitTestFramework} = require('../src').init(config)

const testCases = {
    isDateOrDateTime: [
        {
            input: '01-02-2024',
            output: true,
            description: 'test date format dd-MM-yyyy'
        },
        {
            input: '01/02/2024',
            output: true,
            description: 'test date format dd/MM/yyyy'
        },
        {
            input: '01-02-24',
            output: true,
            description: 'test date format dd-MM-yy'
        },
        {
            input: '01/02/24',
            output: true,
            description: 'test date format dd/MM/yy'
        },
        {
            input: '01-02-2024 12:00:00',
            output: true,
            description: 'test date and time format dd-MM-yyyy HH:mm:ss'
        },
        {
            input: '01/02/2024 12:00:00',
            output: true,
            description: 'test date and time format dd/MM/yyyy HH:mm:ss'
        },
        {
            input: '01-02-24 12:00:00',
            output: true,
            description: 'test date and time format dd-MM-yy HH:mm:ss'
        },
        {
            input: '01/02/24 12:00:00',
            output: true,
            description: 'test date and time format dd/MM/yy HH:mm:ss'
        },
        {
            input: '2024-02-01T12:00:00',
            output: true,
            description: 'test timestamp format yyyy-MM-ddTHH:mm:ss'
        },
        {
            input: '2024-02-01T12:00:00.000Z',
            output: true,
            description: 'test timestamp format yyyy-MM-ddTHH:mm:ss.SSSZ'
        },
        {
            input: '2024-02-01T12:00:00Z',
            output: true,
            description: 'test timestamp format yyyy-MM-ddTHH:mm:ssZ'
        },
        {
            input: 'not a date',
            output: false,
            description: 'test invalid date format'
        }
    ], 
    formatDate: [
        {
            input: ['01-02-2024', 'yyyy-MM-dd'],
            output: '2024-02-01',
            description: 'test format form timestam to yyyy-MM-dd'
        }
    ]
}
const test = new UnitTestFramework(testCases, helperUtils)

test.runTest()