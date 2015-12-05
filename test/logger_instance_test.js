var should = require('chai').should();
var LoggerInstance;

describe('LoggerInstance', function() {

  beforeEach(function() {
    delete require.cache[require.resolve('../lib/logger_instance')];
    LoggerInstance = require('../lib/logger_instance');
  });


  it('has config, context and component properties', function() {
    var loggerInstance = new LoggerInstance('CONFIG', 'CONTEXT', 'COMPONENT');
    loggerInstance.config.should.equal('CONFIG');
    loggerInstance.context.should.equal('CONTEXT');
    loggerInstance.component.should.equal('COMPONENT');
  });

  context('log functions', function(){

    it('defines a function to emit a log message at each level', function() {
      var log = new LoggerInstance;
      log.fatal   .should.be.an.instanceof(Function);
      log.error   .should.be.an.instanceof(Function);
      log.warn    .should.be.an.instanceof(Function);
      log.info    .should.be.an.instanceof(Function);
      log.debug   .should.be.an.instanceof(Function);
      log.$$DEBUG .should.be.an.instanceof(Function);
      log.trace   .should.be.an.instanceof(Function);
      log.$$TRACE .should.be.an.instanceof(Function);
    });

    it('calls the log function', function(done) {
      var log = new LoggerInstance({
        logWriter: {
          isInfoEnabled: function() {
            return true;
          }
        },
        log: function(level, context, component, message) {
          level.should.equal('info');
          context.should.equal('context');
          component.should.equal('component');
          message.should.equal('message');
          done();
        }
      }, 'context', 'component');

      log.info('message');
    });

    it('tests of level is enabled before logging', function(done) {
      var called = false;
      var log = new LoggerInstance({
        logWriter: {
          isInfoEnabled: function() {
            return false;
          }
        },
        log: function(level, context, component, message) {
          called = true;
        }
      }, 'context', 'component');
      setTimeout(function() {
        called.should.equal(false);
        done();
      }, 10);
      log.info('message');
    });

    it('formats the log text from multiple arguments', function(done) {
      var log = new LoggerInstance({
        logWriter: {
          isInfoEnabled: function() {
            return true;
          }
        },
        log: function(level, context, component, message) {
          message.should.equal('string: STRING, number NUMBER, json {"json":"data"}');
          done();
        }
      }, 'context', 'component');

      log.info('string: %s, number %s, json %j', 'STRING', 'NUMBER', {json: 'data'});
    });

    it('includes the array of log arguments in log call if logStackTraces is enabled', function(done) {
      var log = new LoggerInstance({
        logStackTraces: true,
        logWriter: {
          isInfoEnabled: function() {
            return true;
          }
        },
        log: function(level, context, component, message, array) {
          array.should.eql([
            'string: %s, number %s, json %j',
            'STRING',
            'NUMBER',
            {json: 'data'}
          ]);
          done();
        }
      }, 'context', 'component');
      log.info('string: %s, number %s, json %j', 'STRING', 'NUMBER', {json: 'data'});
    })


  });



});
