const path = require('path')
const express = require('express')
const lti = require('ltijs').Provider

// Initialize Express
const app = express()

// Setup LTI Provider
lti.setup('EXAMPLE_KEY',  // 🔑 Replace with a secure secret!
  {
    url: process.env.DATABASE_URL,
  },
  {
    staticPath: path.join(__dirname, './public'),
    cookies: {
      secure: true,
      sameSite: 'None'
    }
  }
)

lti.onConnect(async (token, req, res) => {
  return res.send(`✅ Hello ${token.userInfo.name}! You launched from ${token.platformContext.context.title}.`)
})

const setup = async () => {
  // 🟩 Deploy tool in serverless mode
  await lti.deploy({ app, serverless: true })

  // ✅ Register Moodle Sandbox platform
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

  // ✅ Express route for root
  app.get('/', (req, res) => {
    res.send('👋 Welcome to the LTI 1.3 Tool!')
  })

  // ✅ Listen for requests
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => console.log(`🚀 LTI 1.3 Tool running on port ${PORT}`))
}

setup()
