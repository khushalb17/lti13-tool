const path = require('path')
const express = require('express')
const lti = require('ltijs').Provider

// Setup LTI Provider
lti.setup('EXAMPLE_KEY',  // Replace this with a strong secret key
  {
    url: process.env.DATABASE_URL, // e.g. MongoDB connection string
  },
  {
    staticPath: path.join(__dirname, './public'),
    cookies: {
      secure: false,
      sameSite: 'None'
    }
  }
)

const app = express()

// LTI launch handler
lti.onConnect(async (token, req, res) => {
  console.log('🔁 LTI Launch from:', token.iss)
  return res.send(`Hello ${token.userInfo.name}! You launched the tool from ${token.platformContext.context.title}`)
})

const setup = async () => {
  // Deploy LTI in serverless mode
  await lti.deploy({ serverless: true })

  // Register the Moodle platform
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

  // Mount LTI app
  app.use('/lti', lti.app)

  // Root URL response
  app.get('/', (req, res) => {
    res.send('Welcome to the LTI 1.3 Tool!')
  })

  // Start server
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => console.log(`🚀 LTI 1.3 tool running on port ${PORT}`))
}

setup()
