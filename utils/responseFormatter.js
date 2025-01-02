const setResponseBody = (message, error, data) => {
    return {
        message,
        error,
        data,
    }
}

module.exports = {
    setResponseBody
}