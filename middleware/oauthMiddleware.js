const passport = require('passport')

const authenticateWithGitHub = passport.authenticate('github', { scope: ['user:email'], session: false });

const authenticateWithGoogle =  passport.authenticate('google', { scope: ['profile', 'email'], accessType: "offline", session: false });

const reauthenticateWithGoogle =  passport.authenticate('google', { scope: ['profile', 'email'], accessType: "offline", prompt: "consent", session: false });

module.exports = {
    authenticateWithGitHub,
    authenticateWithGoogle,
    reauthenticateWithGoogle
}