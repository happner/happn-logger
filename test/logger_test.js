var should = require('chai').should();
var fs = require('fs');
var Logger;
var LoggerInstance;

describe('Logger', function() {

  beforeEach(function() {
    delete global['happn-logger'];
    delete require.cache[require.resolve('../lib/logger')];
    delete require.cache[require.resolve('../')];
    delete require.cache[require.resolve('log4js')];
    Logger = require('../');
    LoggerInstance = require('../lib/logger_instance');
    this.origNow = Date.now;
  });

  afterEach(function() {
    Date.now = this.origNow;
    try {
      fs.unlinkSync('file.log');
    } catch (e) {}
  });

  context('configuration', function() {

    it('configuration is passed to all new logger instances', function() {
      Logger.configure({logLevel: 'fatal'});
      var log = Logger.createLogger();
      log.config.logLevel.should.equal('fatal');
      log.should.be.an.instanceof(LoggerInstance);
    });

    it('defaults config', function() {
      Logger.configure();
      var log = Logger.createLogger();
      log.config.should.eql({
        logCacheSize: 50,
        logComponents: [],
        logLevel: 'info',
        logMessageDelimiter: '\t',
        logStackTraces: true,
        logTimeDelta: true,
        logDateFormat: null,
        logLayout: {
          pattern: '[%[%5.5p%]] - %m',
          type: 'pattern'
        },
        logFile: null,
        logFileBackups: 10,
        logFileMaxSize: 20480,
        logFileNameAbsolute: true,
        logWriter: log.config.logWriter, // dodge object
        logger: {
          appenders: [{
            layout: {
              pattern: '[%[%5.5p%]] - %m',
              type: 'pattern'
            },
            makers: log.config.logger.appenders[0].makers, // dodge object
            type: 'console'
          }]
        },
        log: log.config.log // dodge function
      })
    });

  });

  context('logging to console', function() {

    it('logs to console by default', function() {
      Logger.configure({logLevel: 'info'});
      var log = Logger.createLogger('component');
      log.info('XXXXX');
    });

  });

  context('logging to file', function() {

    it('logs to file if a filename is specified', function(done) {
      try {
        fs.unlinkSync('file.log');
      } catch (e) {}
      Logger.configure({
        logFile: 'file.log'
      });
      var log = Logger.createLogger('component');
      log.info('xxxxx');
      setTimeout(function() {
        var logged = fs.readFileSync('file.log').toString();
        logged.should.match(/\(component\) xxxxx/);
        fs.unlinkSync('file.log');
        done();
      }, 100);
    });

    it('can includes a stack trace if enabled and the last arg is an error', function(done) {
      try {
        fs.unlinkSync('file.log');
      } catch (e) {}
      Logger.configure({
        logFile: 'file.log'
      });
      var log = Logger.createLogger('component');
      log.info('xxxxx', new Error('Something'));
      setTimeout(function() {
        var logged = fs.readFileSync('file.log').toString();
        logged.should.match(/ \[ INFO\] - Error: Something/);
        fs.unlinkSync('file.log');
        done();
      }, 100);
    });

  });

  context('emitter', function() {

    it('emits an event before writing to log', function() {
      var befores = 0;
      Logger.emitter.on('before', function() {
        befores++;
      });
      Logger.configure({logLevel: 'info'});
      var log = Logger.createLogger();

      befores.should.equal(0);
      log.trace('xxx');
      befores.should.equal(0);
      log.debug('xxx');
      befores.should.equal(0);
      log.info('xxx');
      befores.should.equal(1);
      log.warn('xxx');
      befores.should.equal(2);
      log.error('xxx');
      befores.should.equal(3);
      log.fatal('xxx');
      befores.should.equal(4);
    });

    it('emits an event after writing to log', function() {
      var afters = 0;
      Logger.emitter.on('after', function() {
        afters++;
      });
      Logger.configure({logLevel: 'info'});
      var log = Logger.createLogger();

      afters.should.equal(0);
      log.trace('xxx');
      afters.should.equal(0);
      log.debug('xxx');
      afters.should.equal(0);
      log.info('xxx');
      afters.should.equal(1);
      log.warn('xxx');
      afters.should.equal(2);
      log.error('xxx');
      afters.should.equal(3);
      log.fatal('xxx');
      afters.should.equal(4);
    });

  });

  context('cache', function() {

    it('enables access to array of recent log messages', function() {
      Logger.configure({
        logCacheSize: 5,
        logLevel: 'all'
      });
      var count = 0;
      Date.now = function() {return count++}

      var log = Logger.createLogger();
      log.trace('A');
      log.debug('B');
      log.info('C');
      log.warn('D');
      log.error('E');
      log.fatal('F');

      Logger.cache.should.eql([
        {
          context: undefined,
          component: undefined,
          level: 'fatal',
          message: 'F',
          timestamp: 5
        },
        {
          context: undefined,
          component: undefined,
          level: 'error',
          message: 'E',
          timestamp: 4
        },
        {
          context: undefined,
          component: undefined,
          level: 'warn',
          message: 'D',
          timestamp: 3
        },
        {
          context: undefined,
          component: undefined,
          level: 'info',
          message: 'C',
          timestamp: 2
        },
        {
          context: undefined,
          component: undefined,
          level: 'debug',
          message: 'B',
          timestamp: 1
        },
        
      ])

    });

  });

  context('component filter', function() {

    it('can filter to log only specified components', function(done) {
      try {
        fs.unlinkSync('file.log');
      } catch (e) {}
      Logger.configure({
        logFile: 'file.log',
        logComponents: ['component1', 'component4']
      });


      var component1 = Logger.createLogger('component1');
      var component2 = Logger.createLogger('component2');
      var component3 = Logger.createLogger('component3');
      
      component1.info('aaaaa');
      component2.info('bbbbb');
      component3.info('ccccc');

      setTimeout(function() {
        var logged = fs.readFileSync('file.log').toString();
        logged.should.match(/\(component1\) aaaaa/);
        logged.should.not.match(/\(component2\) bbbbb/);
        logged.should.not.match(/\(component3\) ccccc/);
        fs.unlinkSync('file.log');
        done();
      }, 100);
    });

    it('logs fatal, error and warn from even if filtered out', function(done) {
      try {
        fs.unlinkSync('file.log');
      } catch (e) {}
      Logger.configure({
        logFile: 'file.log',
        logComponents: ['component1']
      });

      var component1 = Logger.createLogger('component1');
      var component2 = Logger.createLogger('component2');
      var component3 = Logger.createLogger('component3');
      var component4 = Logger.createLogger('component4');
      
      component2.fatal('aaaaa');
      component3.error('bbbbb');
      component4.warn('ccccc');

      setTimeout(function() {
        var logged = fs.readFileSync('file.log').toString();
        logged.should.match(/\(component2\) aaaaa/);
        logged.should.match(/\(component3\) bbbbb/);
        logged.should.match(/\(component4\) ccccc/);
        fs.unlinkSync('file.log');
        done();
      }, 100);
    });

  });

  context('logger subconfig', function() {

    it('allows for entirely externally defined log4js config', function(done) {
      Logger.configure({
        logMessageDelimiter: ' ',
        logTimeDelta: false,
        logger: {
          appenders: [{
            type: 'file',
            filename: 'file.log',
            layout: {
              type: 'pattern',
              pattern: '--- %m ---'
            }
          }]
        }
      });

      var log = Logger.createLogger();
      log.info('XXX');

      setTimeout(function() {
        var logged = fs.readFileSync('file.log').toString();
        logged.should.equal('--- XXX ---\n');
        fs.unlinkSync('file.log');
        done();
      }, 100);


    });

  });

});
