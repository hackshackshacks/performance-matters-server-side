module.exports = {
  init: function () {
    if (!navigator.onLine) {
      console.log('offline')
      var offlineEl = document.createElement('div')
      var text = document.createTextNode('U bent offline, u bekijkt nu een eerder bekeken versie van de website')
      offlineEl.appendChild(text)
      offlineEl.classList.add('offline')
      document.body.appendChild(offlineEl)
    }
  }
}