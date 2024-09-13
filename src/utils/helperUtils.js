const {parse, isValid} = require('date-fns')

function isDateOrDateTime(data) {

    if (typeof data !== 'string') {
        return false
    }

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
        "yyyy-MM-dd HH:mm:ss.SSS",
        "yyyy-MM-dd'T'HH:mm:ss.SSSX", // ISO format
        "yyyy-MM-dd'T'HH:mm:ssX"      // ISO format without milliseconds
    ]

    for (const format of dateFormats) {
            const parsedDate = parse(data, format, new Date())
            if (isValid(parsedDate)) {
            return true
        }
    }

    return false
}
module.exports = {isDateOrDateTime}