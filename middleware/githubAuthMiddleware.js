const passport = require('passport')

const authenticateWithGitHub = passport.authenticate('github', { scope: ['user:email'], session: false });

module.exports = {
    authenticateWithGitHub
}