'use strict';

var utils = require('../utils/writer.js');
var Recomendao = require('../service/RecomendaoService');

module.exports.apiRecommendPOST = function apiRecommendPOST (req, res, next) {
  var car = req.swagger.params['car'].value;
  var text = req.swagger.params['text'].value;
  var audio = req.swagger.params['audio'].value;
  Recomendao.apiRecommendPOST(car,text,audio)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
