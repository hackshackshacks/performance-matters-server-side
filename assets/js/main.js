'use strict';

var jquery = require('jquery');
var Flickity = require('flickity');

var element = document.querySelector('.main-carousel');

var flkty = new Flickity(element, {
  wrapAround: true
});