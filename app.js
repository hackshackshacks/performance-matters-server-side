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

let posterQuery = `
  PREFIX dc: <http://purl.org/dc/elements/1.1/>
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>
  PREFIX sem: <http://semanticweb.cs.vu.nl/2009/11/sem/>
  SELECT ?poster ?title ?img ?date WHERE {
    ?poster dc:type "Poster."^^xsd:string .
    ?poster dc:title ?title .
    ?poster dc:subject "Music."^^xsd:string .
    ?poster foaf:depiction ?img .
  FILTER (REGEX(?title, "Paradiso") || REGEX(?title, "Melkweg")).
    ?poster sem:hasBeginTimeStamp ?date .
    FILTER (?date > "1970-01-01T00:00:00+05:30"^^xsd:dateTime && ?date < "2000-01-01T00:00:00+05:30"^^xsd:dateTime)
  }
  ORDER BY ?date
`
let posterQueryEncoded = encodeURIComponent(posterQuery)
let posterUrl = `https://api.data.adamlink.nl/datasets/AdamNet/all/services/endpoint/sparql?default-graph-uri=&query=${posterQueryEncoded}&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on`

let posters
request(posterUrl, (error, response, body) => {
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
})

let bgQuery = `
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>
  PREFIX dc: <http://purl.org/dc/elements/1.1/>
  PREFIX sem: <http://semanticweb.cs.vu.nl/2009/11/sem/>

  SELECT ?photo ?title ?img ?date WHERE {
    ?photo dc:type "foto"^^xsd:string .
    ?photo dc:title ?title .
    ?photo foaf:depiction ?img .
    FILTER (REGEX(?title, "Weteringschans 6") || REGEX(?title, "Lijnbaansgracht 234A")) .
    ?photo sem:hasBeginTimeStamp ?date .
    FILTER (?date > "1968-05-23T10:20:13+05:30"^^xsd:dateTime && ?date < "2017-05-23T10:20:13+05:30"^^xsd:dateTime)
  }
  ORDER BY ?date
`
let bgQueryEncoded = encodeURIComponent(bgQuery)
let bgUrl = `https://api.data.adamlink.nl/datasets/AdamNet/all/services/endpoint/sparql?default-graph-uri=&query=${bgQueryEncoded}&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on`

let backgrounds
request(bgUrl, (error, response, body) => {
  console.log('error:', error)
  let data = JSON.parse(body).results.bindings
  backgrounds = data.map((item, i) => {
    let obj = {
      url: item.img.value
    }
    return obj
  })
})

function generateDates (time) {
  if (time === 'seventies') {
    return [new Date('1970-01-01T00:00:00+05:30'), new Date('1980-01-01T00:00:00+05:30')]
  } else if (time === 'eighties') {
    return [new Date('1980-01-01T00:00:00+05:30'), new Date('1990-01-01T00:00:00+05:30')]
  } else if (time === 'nineties') {
    return [new Date('1990-01-01T00:00:00+05:30'), new Date('2000-01-01T00:00:00+05:30')]
  }
}
function capitalizeFirst (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
function randomize (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min) // number between min and max
}

app.get('/', (req, res) => {
  res.redirect('/paradiso/seventies')
})
app.get('/:building/:time', (req, res) => {
  let building = req.params.building
  let buildingName = capitalizeFirst(req.params.building)
  let time = req.params.time
  let currentDates = generateDates(time)
  let currentPosters = posters.filter((poster) => {
    let posterDate = new Date(poster.date)
    return posterDate >= currentDates[0] && posterDate <= currentDates[1] && poster.title.includes(buildingName)
  })
  res.render('index.html', {
    buildings: buildings,
    times: times,
    currentBuilding: building,
    currentTime: time,
    posters: currentPosters,
    background: backgrounds[randomize(0, backgrounds.length)].url
  })
})
app.listen(8001, () => {
  console.log('Listening.. port 8001')
})
