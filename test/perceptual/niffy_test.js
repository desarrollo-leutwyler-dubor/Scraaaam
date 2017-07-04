/*jshint esnext:true*/

var debug = require('debug')('niffy:test');
var should = require('chai').should();
var Niffy = require('niffy');

describe('App', function () {
  var niffy

  before(function () {
    niffy = new Niffy(
      'http://app:3001',
      'http://app-dev:3002',
      { show: false }
    )
  })

  it('Homepage', function* () {
    yield niffy.test('/')
  })

  after(function* () {
    yield niffy.end()
  })
})
