const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "MISSING_GOOGLE_CLIENT_ID",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "MISSING_GOOGLE_CLIENT_SECRET",
      callbackURL: `${process.env.BACKEND_URL || "http://localhost:3001"}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const picture = profile.photos?.[0]?.value;
        const fullName = profile.displayName;
        const googleId = profile.id;

        if (!email) {
          return done(new Error("Google account has no email"), null);
        }

        // Find existing user or create new one
        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (!user) {
          user = await User.create({
            fullName,
            email,
            googleId,
            picture,
            // No password for Google-auth users
            password: `google_${googleId}`,
          });
        } else {
          // Update picture/googleId if missing
          if (!user.googleId) user.googleId = googleId;
          if (picture && !user.picture) user.picture = picture;
          await user.save();
        }

        const token = generateToken(user._id);
        return done(null, { user, token });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Passport serialize/deserialize (needed for session middleware)
passport.serializeUser((data, done) => done(null, data));
passport.deserializeUser((data, done) => done(null, data));

module.exports = passport;
