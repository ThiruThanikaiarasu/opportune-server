class EmailError extends Error {
    constructor(message, statusCode) {
        super(message)
        this.name = "EmailError"
        this.statusCode = statusCode
    }
}

module.exports = EmailError