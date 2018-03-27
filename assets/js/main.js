'use strict';

var jquery = require('jquery');
var Flickity = require('flickity');
var offline = require('./offline.js');
var element = document.querySelector('.main-carousel');

offline.init()

if (element) {
  var flkty = new Flickity(element, {
    wrapAround: true
  });
}
