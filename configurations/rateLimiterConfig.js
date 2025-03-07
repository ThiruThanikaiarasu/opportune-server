const rateLimiterConfig = {

    standard: {
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            status: 429,
            message: 'Too many requests, please try again later.'
        }
    },
    
    auth: {
        windowMs: 15 * 60 * 1000,
        max: 20,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            status: 429,
            message: 'Too many authentication attempts, please try again later.'
        }
    },
    
    contentBrowsing: {
        windowMs: 15 * 60 * 1000, 
        max: 300,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            status: 429,
            message: 'Browsing limit exceeded, please slow down.'
        }
    }
  }
  
  module.exports = rateLimiterConfig