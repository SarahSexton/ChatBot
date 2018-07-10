// Add your requirements
var restify = require('restify')
var builder = require('botbuilder')
const dotenv = require('dotenv')
dotenv.load()

// Setup Restify Server
var server = restify.createServer()
server.listen(process.env.port || process.env.PORT || 3978, function () {
  console.log('%s listening to %s', server.name, server.url)
})

// Serve a static web page
server.get(/\/?.*/, restify.plugins.serveStatic({
  'directory': '.',
  'default': 'index.html'
}))

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
  appId: process.env.AppID,
  appPassword: process.env.AppPassword
})
// console.log(connector);
// Listen for messages from users
server.post('/api/messages', connector.listen())

var bot = new builder.UniversalBot(connector)

// Set up LUIS connection
var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/' + process.env.LUISID + '?subscription-key=' + process.env.LUISKEY + '&verbose=true&timezoneOffset=0&q='
var recognizer = new builder.LuisRecognizer(model)
var dialog = new builder.IntentDialog({ recognizers: [recognizer] })

bot.dialog('/', dialog)

dialog.matches('greeting', [
  function (session, args, next) {
    session.send('Hello!')
    console.log('Hello!')
    console.log(session)
  }
])

dialog.matches('farewell', [
  function (session, results) {
    session.send('Bye!')
  }
])

dialog.onDefault([
  function (session, results) {
    session.send("That one didn't work.")
    session.beginDialog('/', results)
  }
])
