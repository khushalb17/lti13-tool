const path = require('path')
const express = require('express')
const lti = require('ltijs').Provider

lti.setup('EXAMPLE_KEY',
  {
    url: 'mongodb://localhost:27017/lti13'
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

lti.onConnect(async (token, req, res) => {
  return res.send(`Hello ${token.userInfo.name}! You launched the tool from ${token.platformContext.context.title}`)
})

const setup = async () => {
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

  await lti.deploy({ serverless: true })
  app.use('/lti', lti.app)
  app.listen(3000, () => console.log('LTI 1.3 tool listening on port 3000!'))
}

setup()
