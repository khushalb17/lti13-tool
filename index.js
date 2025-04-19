const path = require('path')
const express = require('express')
const lti = require('ltijs').Provider
require('dotenv').config()

// Setup LTI Provider
lti.setup(process.env.LTI_KEY || 'dev-secret-key',
  {
    url: process.env.DATABASE_URL, // MongoDB connection string from Render env
  },
  {
    staticPath: path.join(__dirname, './public'),
    cookies: {
      secure: true,
      sameSite: 'None'
    }
  }
)

const app = express()

// LTI Launch Response
lti.onConnect(async (token, req, res) => {
  const name = token.userInfo?.name || 'user'
  const context = token.platformContext?.context?.title || 'unknown context'
  return res.send(`✅ Hello ${name}! You launched the tool from "${context}".`)
})

const setup = async () => {
  try {
    console.log('🚀 Deploying LTI tool...')
    await lti.deploy({ serverless: true })
    console.log('✅ LTI provider deployed!')

    // Check if already registered to avoid duplicates
    const existing = await lti.getPlatform('https://sandbox.moodledemo.net/')
    if (!existing) {
      console.log('📡 Registering Moodle platform...')
      await lti.registerPlatform({
        url: 'https://sandbox.moodledemo.net/',
        name: 'Moodle Demo',
        clientId: 'YrhUuY3LG4Oh1AF',
        authenticationEndpoint: 'https://sandbox.moodledemo.net/mod/lti/auth.php',
        accesstokenEndpoint: 'https://sandbox.moodledemo.net/mod/lti/token.php',
        authConfig: {
          method: 'JWK_SET',
          keysetUrl: 'https://sandbox.moodledemo.net/mod/lti/certs.php'
        }
      })
      console.log('✅ Moodle platform registered!')
    } else {
      console.log('✅ Moodle platform already registered.')
    }

    // Express routes
    app.use('/lti', lti.app)

    app.get('/', (req, res) => {
      res.send('🎉 Welcome to the LTI 1.3 Tool!')
    })

    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => console.log(`🌐 LTI tool running on port ${PORT}`))
  } catch (err) {
    console.error('❌ Setup failed:', err)
  }
}

setup()
