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
    smallName: 'paradiso',
    address: 'Weteringschans 6'
  },
  {
    name: 'Melkweg',
    smallName: 'melkweg',
    address: 'Lijnbaansgracht 234A'
  }
]
const times = [
  {
    name: 'Seventies',
    smallName: 'seventies'
  },
  {
    name: 'Eighties',
    smallName: 'eighties'
  },
  {
    name: 'Nineties',
    smallName: 'nineties'
  }
]
function generatePosterUrl (title, dateOne, dateTwo) {
  let query = `
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX sem: <http://semanticweb.cs.vu.nl/2009/11/sem/>
    SELECT ?poster ?title ?img ?date WHERE {
      ?poster dc:type "Poster."^^xsd:string .
      ?poster dc:title ?title .
      ?poster dc:subject "Music."^^xsd:string .
      ?poster foaf:depiction ?img .
      FILTER REGEX(?title, "${title}") .
      ?poster sem:hasBeginTimeStamp ?date .
      FILTER (?date > "${dateOne}"^^xsd:dateTime && ?date < "${dateTwo}"^^xsd:dateTime)
    }
    ORDER BY ?date
  `
  console.log(query)
  let encodedQuery = encodeURIComponent(query)
  return `https://api.data.adamlink.nl/datasets/AdamNet/all/services/endpoint/sparql?default-graph-uri=&query=${encodedQuery}&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on`
}
function generateDates (time) {
  if (time === 'seventies') {
    return ['1970-01-01T00:00:00+05:30', '1980-01-01T00:00:00+05:30']
  } else if (time === 'eighties') {
    return ['1980-01-01T00:00:00+05:30', '1990-01-01T00:00:00+05:30']
  } else if (time === 'nineties') {
    return ['1990-01-01T00:00:00+05:30', '2000-01-01T00:00:00+05:30']
  }
}
function capitalizeFirst (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
app.get('/', (req, res) => {
  res.redirect('/paradiso/seventies')
})
app.get('/:building/:time', (req, res) => {
  let dates = generateDates(req.params.time)
  let url = generatePosterUrl(capitalizeFirst(req.params.building), dates[0], dates[1])
  let posters
  request(url, (error, response, body) => {
    console.log('error:', error)
    let data = JSON.parse(body).results.bindings
    posters = data.map((item) => {
      let obj = {
        title: item.title.value,
        date: item.date.value,
        url: item.img.value
      }
      return obj
    })
    res.render('index.html', {
      buildings: buildings,
      times: times,
      currentBuilding: req.params.building,
      currentTime: req.params.time,
      posters: posters
    })
  })
})
app.listen(8001, () => {
  console.log('Listening.. port 8001')
})
