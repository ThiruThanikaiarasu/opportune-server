const rateLimit = require('express-rate-limit')
const rateLimiterConfig = require('../configurations/rateLimiterConfig')

const shouldSkipRateLimit = (request) => {
    if (!request || !request.path) {
        return false
    }

    const skippableEndpoints = [
        '/api/v1/user/checkUsername',
        '/api/v1/project/search',
        '/api/v1/project/tag',
        '/api/v1/project/tags',
        '/api/v1/user/skills',
    ]

    const fullPath = request.originalUrl.split('?')[0] 

    return skippableEndpoints.includes(fullPath)  
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
