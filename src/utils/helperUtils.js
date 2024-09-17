const {parse, isValid, format} = require('date-fns')

const dateFormats = [
    "yyyy-MM-dd",
    "yyyy/MM/dd",
    "dd-MM-yyyy",
    "dd/MM/yyyy",
    "MM-dd-yyyy",
    "MM/dd/yyyy",
    "yyyy-MM-dd HH:mm:ss",
    "yyyy/MM/dd HH:mm:ss",
    "dd-MM-yyyy HH:mm:ss",
    "dd/MM/yyyy HH:mm:ss",
    "MM-dd-yyyy HH:mm:ss",
    "MM/dd/yyyy HH:mm:ss",
    "yyyy-MM-dd'T'HH:mm:ss",
    "yyyy-MM-dd HH:mm:ss.SSS",
    "yyyy-MM-dd'T'HH:mm:ss.SSSX", // ISO format
    "yyyy-MM-dd'T'HH:mm:ssX"      // ISO format without milliseconds
]

function isDateOrDateTime(date) {

    if (typeof date !== 'string') return false

    for (const item of dateFormats) {
            const parsedDate = parse(date, item, new Date())
            if (isValid(parsedDate)) {
            return true
        }
    }

    return false
}

function formatDate(date, dateFormat = 'yyyy-MM-dd'){

    if (typeof date !== 'string') return null

    for (const item of dateFormats) {
        const parsedDate = parse(date, item, new Date())
        if (isValid(parsedDate)) {
            return format(parsedDate, dateFormat)
        }
    }

    return null
}

module.exports = {isDateOrDateTime, formatDate}

