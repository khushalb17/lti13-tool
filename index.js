const path = require('path')
const express = require('express')
const { Provider } = require('ltijs')
require('dotenv').config()

const lti = new Provider('EXAMPLE_KEY', {
  url: process.env.DATABASE_URL, // MongoDB URL (required for platform registration persistence)
}, {
  staticPath: path.join(__dirname, './public'),
  cookies: {
    secure: true,
    sameSite: 'None'
  }
})

const app = express()

// LTI Launch route
lti.onConnect(async (token, req, res) => {
  return res.send(`✅ Hello ${token.userInfo.name}! You launched the tool from "${token.platformContext.context.title}"`)
})

const setup = async () => {
  await lti.deploy({ serverless: true })

  // Register the Moodle platform (make sure clientId is correct)
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

  // Serve ltijs app routes like login, launch, JWKS, etc.
  app.use('/lti', lti.app)

  // Optional root route
  app.get('/', (req, res) => {
    res.send('🌟 Welcome to the LTI 1.3 Tool!')
  })

  // Start server
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => console.log(`🚀 LTI 1.3 tool listening on port ${PORT}`))
}

setup()
