const path = require('path')
const express = require('express')
const lti = require('ltijs').Provider

const DATABASE_URL = 'mongodb+srv://bharathabk84:JNMEy6h2Na8v7KsK@bharathabk.g0okgx8.mongodb.net/?retryWrites=true&w=majority&appName=bharathabk'

// Setup LTI Provider
lti.setup('EXAMPLE_KEY', // Replace with your own secure key
  {
    url: DATABASE_URL,
    connection: { user: '', pass: '' }
  },
  {
    staticPath: path.join(__dirname, './public'),
    cookies: {
      secure: true,
      sameSite: 'None'
    },
    devMode: true // Required for platforms like Moodle sandbox
  }
)

const setup = async () => {
  // Deploy serverless
  await lti.deploy({ serverless: true })

  // Register Moodle platform
  await lti.registerPlatform({
    url: 'https://sandbox.moodledemo.net',
    name: 'Moodle Demo',
    clientId: 'YrhUuY3LG4Oh1AF',
    authenticationEndpoint: 'https://sandbox.moodledemo.net/mod/lti/auth.php',
    accesstokenEndpoint: 'https://sandbox.moodledemo.net/mod/lti/token.php',
    authConfig: {
      method: 'JWK_SET',
      keysetUrl: 'https://sandbox.moodledemo.net/mod/lti/certs.php'
    }
  })
}

setup()

// Express app for root and LTI
const app = express()
app.use('/lti', lti.app)  // LTI routes

// Root for testing
app.get('/', (req, res) => {
  res.send('Welcome to the LTI 1.3 Tool!')
})

// For manual health check or public keyset
app.get('/.well-known/jwks', (req, res) => {
  res.json(lti.getJwks())
})

// Custom LTI launch handler
lti.onConnect(async (token, req, res) => {
  return res.send(`Hello ${token.userInfo.name}! You launched from ${token.platformContext.context.title}`)
})

// Start server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`LTI 1.3 Tool is running on port ${PORT}`)
})
