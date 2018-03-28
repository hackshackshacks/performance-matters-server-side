const express = require('express')
const app = express()
const nunjucks = require('nunjucks')
const request = require('request')
const compression = require('compression')

app.use(compression())
app.use(express.static(`${__dirname}/assets`))

nunjucks.configure('assets/views', {
  autoescape: true,
  express: app
})

const core = {
  buildings: [
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
  ],
  times: [
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
  ],
  posters: [],
  backgrounds: [],
  init: function () {
    api.init()
  }
}
const api = {
  posterQuery: `
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
    ORDER BY ?date`,
  backgroundQuery: `
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
    ORDER BY ?date`,
  init: function () {
    this.getPosters()
    this.getBackgrounds()
  },
  getPosters: function () {
    let posterQueryEncoded = encodeURIComponent(this.posterQuery)
    let posterUrl = `https://api.data.adamlink.nl/datasets/AdamNet/all/services/endpoint/sparql?default-graph-uri=&query=${posterQueryEncoded}&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on`

    request(posterUrl, (error, response, body) => {
      console.log('error:', error)
      let data = JSON.parse(body).results.bindings
      core.posters = data.map((item) => {
        let obj = {
          title: item.title.value,
          date: item.date.value,
          url: item.img.value,
          url2: item.img.value.replace('level3', 'level2')
        }
        return obj
      })
    })
  },
  getBackgrounds: function () {
    let bgQueryEncoded = encodeURIComponent(this.backgroundQuery)
    let bgUrl = `https://api.data.adamlink.nl/datasets/AdamNet/all/services/endpoint/sparql?default-graph-uri=&query=${bgQueryEncoded}&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on`

    request(bgUrl, (error, response, body) => {
      console.log('error:', error)
      let data = JSON.parse(body).results.bindings
      core.backgrounds = data.map((item, i) => {
        let obj = {
          url: item.img.value
        }
        return obj
      })
    })
  }
}

const helper = {
  generateDates: function (time) {
    if (time === 'seventies') {
      return [new Date('1970-01-01T00:00:00+05:30'), new Date('1980-01-01T00:00:00+05:30')]
    } else if (time === 'eighties') {
      return [new Date('1980-01-01T00:00:00+05:30'), new Date('1990-01-01T00:00:00+05:30')]
    } else if (time === 'nineties') {
      return [new Date('1990-01-01T00:00:00+05:30'), new Date('2000-01-01T00:00:00+05:30')]
    }
  },
  capitalizeFirst: function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  },
  randomize: function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min) // number between min and max
  }
}

core.init()
setInterval(() => { // rerun every 24 hours
  core.init()
}, 1000 * 60 * 60 * 24)
app.get('/', (req, res) => {
  res.render('index.html', {
    background: core.backgrounds[helper.randomize(0, core.backgrounds.length)].url,
    times: core.times,
    buildings: core.buildings
  })
})
app.get('/:building/:time', (req, res) => {
  let building = req.params.building
  let buildingName = helper.capitalizeFirst(req.params.building)
  let time = req.params.time
  let currentDates = helper.generateDates(time)
  let currentPosters = core.posters.filter((poster) => {
    let posterDate = new Date(poster.date)
    return posterDate >= currentDates[0] && posterDate <= currentDates[1] && poster.title.includes(buildingName)
  })
  res.render('detail.html', {
    buildings: core.buildings,
    times: core.times,
    currentBuilding: building,
    currentTime: time,
    posters: currentPosters,
    background: core.backgrounds[helper.randomize(0, core.backgrounds.length - 1)].url
  })
})

app.listen(8001, () => {
  console.log('Listening.. port 8001')
})
