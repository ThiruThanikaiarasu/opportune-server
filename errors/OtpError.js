class OtpError extends Error {
    constructor(message, statusCode) {
        super(message)
        this.name = 'OtpError'
        this.statusCode = statusCode
    }
}

module.exports = OtpError