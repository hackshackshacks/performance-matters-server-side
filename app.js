const express = require('express')
const app = express()
const nunjucks = require('nunjucks')

app.use(express.static(__dirname + '/dist'))

nunjucks.configure('views', {
  autoescape: true,
  express: app
})

app.get('/', (req, res) => {
  res.render('index.html', {
    message: 'Heyo'
  })
})

app.listen(8001, () => {
  console.log('Listening.. port 8001')
})
