const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy 
const { ExtractJwt } = require('passport-jwt')
const LocalStrategy = require('passport-local').Strategy
const GooglePlusTokenStrategy = require('passport-google-plus-token')
const TwitterTokenStrategy = require('passport-twitter-token')
const User = require ('./models/user')
const config = require('./configuration')
const { JWT_SECRET } = require('./configuration')

console.log( config.oauth.twitter.clientID)

// JSON WEB TOKENS STRATEGY
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.JWT_SECRET
  }, async (payload, done) => {
    try {
      // Find the user specified in token
      const user = await User.findById(payload.sub)
  
      // If user doesn't exists, handle it
      if (!user) {
        return done(null, false)
      }
  
      // Otherwise, return the user
      done(null, user)
    } catch(error) {
      done(error, false)
    }
  }))
// GOOGLE OAUTH STRATEGY
passport.use('googleToken',new GooglePlusTokenStrategy({
  clientID: config.oauth.google.clientID,
  clientSecret: config.oauth.google.clientSecret
}, async(acessToken, refreshToken, profile, done) => {
  try{
    const existingUser = await User.findOne({ "google.id": profile.id })
    if(existingUser){
      console.log('User already exists in our DB')
      return done(null, existingUser)
    }
    console.log('New user, creating...')

    const newUser = new User({
      method: 'google',
      id: profile.id,
      email: profile.email[0].value
    })
    await newUser.save()
    done(null, newUser)
  } catch(error){
    done(error, false, error.message)
  }
 


}))
//  TWITTER OAUTH STRATEGY
passport.use('twitterToken', new TwitterTokenStrategy({
  clientID: config.oauth.twitter.clientID,
  clientSecret: config.oauth.twitter.clientSecret
}, async( acessToken, refreshToken, profile, done) => {
  try {
   console.log('profile', profile)
   console.log('profile', acessToken)
   console.log('profile', refreshToken)

    
  } catch(error){
    done(error, false, error.message)
  }
}))

// LOCAL STRATEGY
passport.use(new LocalStrategy({
    usernameField: 'email'
}, async (email, password, done) => {
    try{    
    // find the user given the email
    const user = await User.findOne({ "local.email": email })
    // if not, handle it
    if(!user){ done(null,false)}
    //Check if the password is correct
    const isMatch = await user.isValidPassword(password)
    //if not, handle it
    if(!isMatch){return done(null,false)}
    //Otherwise return the user
    done(null, user)
    } catch(error) {
        done(error,false)
    }

}))