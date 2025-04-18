const path = require('path')
const express = require('express')
const lti = require('ltijs').Provider

// Setup LTI Provider
lti.setup('EXAMPLE_KEY',  // Replace this key with a strong secret
  {
    url: process.env.DATABASE_URL,  // e.g. MongoDB Atlas connection string
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

// Handle LTI Launch
lti.onConnect(async (token, req, res) => {
  return res.send(`Hello ${token.userInfo.name}! You launched the tool from ${token.platformContext.context.title}`)
})

const setup = async () => {
  // ✅ First deploy
  await lti.deploy({ serverless: true })

  // ✅ Then register the platform
await lti.registerPlatform({
  url: 'https://sandbox.moodledemo.net',
  name: 'Moodle Demo',
  clientId: 'YrhUuY3LG4Oh1AF',
  authenticationEndpoint: 'https://sandbox.moodledemo.net/mod/lti/auth.php',
  accesstokenEndpoint: 'https://sandbox.moodledemo.net/mod/lti/token.php',
  authConfig: {
    method: 'JWK_SET',
    key: 'https://sandbox.moodledemo.net/mod/lti/certs.php'
  }
})

app.use('/lti', lti.app)

// Root URL route
app.get('/', (req, res) => {
  res.send('Welcome to the LTI 1.3 Tool!');
})

// Start the server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`LTI 1.3 tool listening on port ${PORT}!`))
}

setup()
