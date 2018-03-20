const express = require('express')
const app = express()
const nunjucks = require('nunjucks')
const request = require('request')

app.use(express.static(`${__dirname}/dist`))

nunjucks.configure('views', {
  autoescape: true,
  express: app
})

app.get('/', (req, res) => {
  res.render('index.html')
})

app.get('/api', function (req, res) {
  let query = `
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX sem: <http://semanticweb.cs.vu.nl/2009/11/sem/>
    SELECT ?poster ?title ?img ?date WHERE {
      ?poster dc:type "Poster."^^xsd:string .
      ?poster dc:title ?title .
      ?poster dc:subject "Music."^^xsd:string .
      ?poster foaf:depiction ?img .
      FILTER REGEX(?title, "${req.query.title}") .
      ?poster sem:hasBeginTimeStamp ?date .
      FILTER (?date > "${req.query.dateOne}T10:20:13+05:30"^^xsd:dateTime && ?date < "${req.query.dateTwo}T10:20:13+05:30"^^xsd:dateTime)
    }
    ORDER BY ?date
  `
  let encodedQuery = encodeURIComponent(query)
  let url = `https://api.data.adamlink.nl/datasets/AdamNet/all/services/endpoint/sparql?default-graph-uri=&query=${encodedQuery}&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on`

  request(url, (error, response, body) => {
    let data = JSON.parse(body).results.bindings
    let usefulData = data.map((item) => {
      let obj = {
        title: item.title.value,
        date: item.date.value,
        url: item.img.value
      }
      return obj
    })
    res.render('index.html', {
      data: usefulData
    })
  })
})

app.listen(8001, () => {
  console.log('Listening.. port 8001')
})
