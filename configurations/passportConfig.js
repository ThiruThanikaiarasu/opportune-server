const passport = require('passport');
const GitHubStrategy = require("passport-github2").Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

require("dotenv").config();

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_OAUTH_CALLBACK_URL,
      scope: ['user:email']
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, { profile, accessToken });
    }
  )
)

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_OAUTH_CALLBACK_URL,
      scope: ['profile', 'email'],
      accessType: "offline",
      prompt: "consent"
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, { profile, accessToken, refreshToken });
    }
  )
)

module.exports = passport;
