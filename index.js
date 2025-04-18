const path = require('path')
const express = require('express')
const lti = require('ltijs').Provider

// Create Express app
const app = express()

// Setup LTI Provider
lti.setup('EXAMPLE_KEY',  // Use a secure secret in production
  {
    url: process.env.DATABASE_URL,  // MongoDB connection string
  },
  {
    appRoute: '/',         // Root route for landing page
    loginRoute: '/lti/login',   // Initiate login
    cookies: {
      secure: true,
      sameSite: 'None'
    },
    devMode: false
  }
)

// Serve a simple welcome page on "/"
app.get('/', (req, res) => {
  res.send('Welcome to the LTI 1.3 Tool!')
})

// LTI Launch Handler
lti.onConnect(async (token, req, res) => {
  return res.send(`Hello ${token.userInfo.name}! You launched from ${token.platformContext.context.title}`)
})

const setup = async () => {
  // ✅ Start LTI server in serverless mode and pass express app
  await lti.deploy({ serverless: true, app })

  // ✅ Register Moodle Platform
  await lti.registerPlatform({
    url: 'https://sandbox.moodledemo.net/',  // NOTE: trailing slash
    name: 'Moodle Demo',
    clientId: 'YrhUuY3LG4Oh1AF',
    authenticationEndpoint: 'https://sandbox.moodledemo.net/mod/lti/auth.php',
    accesstokenEndpoint: 'https://sandbox.moodledemo.net/mod/lti/token.php',
    authConfig: {
      method: 'JWK_SET',
      keysetUrl: 'https://sandbox.moodledemo.net/mod/lti/certs.php'
    }
  })

  // ✅ Start express server
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => console.log(`LTI tool listening on port ${PORT}`))
}

setup()
