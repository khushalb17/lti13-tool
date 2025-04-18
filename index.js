const path = require('path')
const express = require('express')
const lti = require('ltijs').Provider

// Setup LTI Provider
lti.setup('EXAMPLE_KEY',  // 🔐 Replace with a strong secret in production
  {
    url: process.env.DATABASE_URL,  // 📦 MongoDB connection string from Render environment
  },
  {
    staticPath: path.join(__dirname, './public'),
    cookies: {
      secure: true,           // ✅ Should be true in production with HTTPS
      sameSite: 'None'
    }
  }
)

const app = express()

// Handle LTI Launch
lti.onConnect(async (token, req, res) => {
  console.log('🔁 Incoming LTI Launch from:', token.iss)  // Log issuer to verify registration
  return res.send(`👋 Hello ${token.userInfo.name}! You launched the tool from <b>${token.platformContext.context.title}</b>`)
})

const setup = async () => {
  // ✅ Deploy in serverless mode
  await lti.deploy({ serverless: true })

  // ✅ Register Moodle platform
  await lti.registerPlatform({
    url: 'https://sandbox.moodledemo.net',
    name: 'Moodle Demo',
    clientId: 'IA8ZcxJ0U7JWBXp',
    authenticationEndpoint: 'https://sandbox.moodledemo.net/mod/lti/auth.php',
    accesstokenEndpoint: 'https://sandbox.moodledemo.net/mod/lti/token.php',
    authConfig: {
      method: 'JWK_SET',
      keysetUrl: 'https://sandbox.moodledemo.net/mod/lti/certs.php'
    }
  })

  // Mount LTI app
  app.use('/lti', lti.app)

  // Welcome route for health check
  app.get('/', (req, res) => {
    res.send('🚀 Welcome to the LTI 1.3 Tool!')
  })

  // Start Express server
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => console.log(`✅ LTI 1.3 tool listening on port ${PORT}!`))
}

setup()
