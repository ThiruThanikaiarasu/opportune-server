const passport = require('passport')

const authenticateWithGitHub = passport.authenticate('github', { scope: ['user:email'], session: false });

const authenticateWithGoogle =  passport.authenticate('google', { scope: ['profile', 'email'], session: false });

module.exports = {
    authenticateWithGitHub,
    authenticateWithGoogle
}