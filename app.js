const express = require('express')
const app = express()
const nunjucks = require('nunjucks')
const request = require('request')

app.use(express.static(`${__dirname}/dist`))

nunjucks.configure('views', {
  autoescape: true,
  express: app
})

const buildings = [
  {
    name: 'Paradiso',
    address: 'Weteringschans 6',
    dateRange: [
      ['1968-05-23T10:20:13+05:30', '1972-05-23T10:20:13+05:30'],
      ['1972-05-23T10:20:13+05:30', '1975-05-23T10:20:13+05:30'],
      ['1975-05-23T10:20:13+05:30', '1980-05-23T10:20:13+05:30'],
      ['1980-05-23T10:20:13+05:30', '1990-05-23T10:20:13+05:30'],
      ['1990-05-23T10:20:13+05:30', '2100-05-23T10:20:13+05:30']
    ]
  },
  {
    name: 'Melkweg',
    address: 'Lijnbaansgracht 234A',
    dateRange: [
      ['1968-05-23T10:20:13+05:30', '2017-05-23T10:20:13+05:30'],
      ['1972-05-23T10:20:13+05:30', '1975-05-23T10:20:13+05:30'],
      ['1975-05-23T10:20:13+05:30', '1980-05-23T10:20:13+05:30'],
      ['1980-05-23T10:20:13+05:30', '1990-05-23T10:20:13+05:30'],
      ['1990-05-23T10:20:13+05:30', '2100-05-23T10:20:13+05:30']
    ]
  }
]

app.get('/', (req, res) => {
  let query = `
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX sem: <http://semanticweb.cs.vu.nl/2009/11/sem/>
    SELECT ?poster ?title ?img ?date WHERE {
      ?poster dc:type "Poster."^^xsd:string .
      ?poster dc:title ?title .
      ?poster dc:subject "Music."^^xsd:string .
      ?poster foaf:depiction ?img .
      FILTER REGEX(?title, "${buildings[0].title}") .
      ?poster sem:hasBeginTimeStamp ?date .
      FILTER (?date > "${buildings[0].dateRange[0][0]}"^^xsd:dateTime && ?date < "${buildings[0].dateRange[0][1]}"^^xsd:dateTime)
    }
    ORDER BY ?date
  `
  let encodedQuery = encodeURIComponent(query)
  let url = `https://api.data.adamlink.nl/datasets/AdamNet/all/services/endpoint/sparql?default-graph-uri=&query=${encodedQuery}&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on`

  let posters
  request(url, (error, response, body) => {
    let data = JSON.parse(body).results.bindings
    posters = data.map((item) => {
      let obj = {
        title: item.title.value,
        date: item.date.value,
        url: item.img.value
      }
      return obj
    })
    console.log(posters)
    res.render('index.html', {
      buildings: buildings,
      posters: posters
    })
  })
})

app.listen(8001, () => {
  console.log('Listening.. port 8001')
})
