const path = require('path')
const express = require('express')
const lti = require('ltijs').Provider

// Setup LTI Provider
lti.setup(
  process.env.LTI_KEY || 'EXAMPLE_KEY', // Use env var or fallback
  { url: process.env.DATABASE_URL },    // MongoDB connection string
  {
    staticPath: path.join(__dirname, './public'),
    cookies: {
      secure: true,
      sameSite: 'None'
    }
  }
)

const app = express()

// Route: LTI Launch
lti.onConnect(async (token, req, res) => {
  const name = token.userInfo.name || 'LTI user'
  const course = token.platformContext?.context?.title || 'your LMS'
  return res.send(`✅ Hello ${name}! You launched the tool from <strong>${course}</strong>.`)
})

const setup = async () => {
  // Deploy ltijs server in serverless mode (for Render)
  await lti.deploy({ serverless: true })

  // Register Moodle platform (make sure this matches your LMS)
  await lti.registerPlatform({
    url: 'https://sandbox.moodledemo.net', // NO trailing slash!
    name: 'Moodle Demo',
    clientId: 'YrhUuY3LG4Oh1AF',
    authenticationEndpoint: 'https://sandbox.moodledemo.net/mod/lti/auth.php',
    accesstokenEndpoint: 'https://sandbox.moodledemo.net/mod/lti/token.php',
    authConfig: {
      method: 'JWK_SET',
      keysetUrl: 'https://sandbox.moodledemo.net/mod/lti/certs.php'
    }
  })

  // Add ltijs express app to route
  app.use('/lti', lti.app)

  // Optional root route
  app.get('/', (req, res) => {
    res.send('👋 Welcome to the LTI 1.3 Tool!')
  })

  // Start the server
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`🚀 LTI 1.3 tool listening at http://localhost:${PORT}`)
  })
}

setup()
