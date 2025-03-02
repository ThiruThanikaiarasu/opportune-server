const rateLimit = require('express-rate-limit')
const rateLimiterConfig = require('../configurations/rateLimiterConfig')

const shouldSkipRateLimit = (request) => {
    if (!request || !request.path) return false

    const skippableEndpoints = ['/api/v1/user/checkUsername']
    return skippableEndpoints.includes(request.path)
}

const createRateLimiterInstance = (config) => {
    const limiter = rateLimit(config)
    return (request, response, next) => {
        if (shouldSkipRateLimit(request)) {
            return next()
        }
        return limiter(request, response, next)
    }
}

const rateLimiterMiddleware = {
    standard: createRateLimiterInstance(rateLimiterConfig.standard),
    contentBrowsing: createRateLimiterInstance(rateLimiterConfig.contentBrowsing),
    auth: createRateLimiterInstance(rateLimiterConfig.auth),
}

module.exports = rateLimiterMiddleware
