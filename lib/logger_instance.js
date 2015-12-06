module.exports = LoggerInstance;

var util = require('util');

function LoggerInstance(config, context, component) {
  Object.defineProperty(this, 'config', {
    get: function() {
      return config
    }
  });
  Object.defineProperty(this, 'context', {value: context});
  Object.defineProperty(this, 'component', {value: component});

  this.fatal = this.fatal;
  this.error = this.error;
  this.warn = this.warn;
  this.info = this.info;
  this.debug = this.debug;
  this.$$DEBUG = this.$$DEBUG;
  this.trace = this.trace;
  this.$$TRACE = this.$$TRACE;
}

LoggerInstance.prototype.createLogger = function(component) {
  return new LoggerInstance(this.config, this.context, component);
}

LoggerInstance.prototype.fatal = function() {
  if (!this.config.logWriter.isFatalEnabled()) return;
  var message = util.format.apply(this, arguments);
  var array = Array.prototype.slice.call(arguments);
  this.config.log('fatal', this.context, this.component, message, array);
}

LoggerInstance.prototype.error = function() {
  if (!this.config.logWriter.isErrorEnabled()) return;
  var message = util.format.apply(this, arguments);
  var array = Array.prototype.slice.call(arguments);
  this.config.log('error', this.context, this.component, message, array);
}

LoggerInstance.prototype.warn = function() {
  if (!this.config.logWriter.isWarnEnabled()) return;
  var message = util.format.apply(this, arguments);
  var array = Array.prototype.slice.call(arguments);
  this.config.log('warn', this.context, this.component, message, array);
}

LoggerInstance.prototype.info = function() {
  if (!this.config.logWriter.isInfoEnabled()) return;
  var message = util.format.apply(this, arguments);
  var array = Array.prototype.slice.call(arguments);
  this.config.log('info', this.context, this.component, message, array);
}

LoggerInstance.prototype.log =
LoggerInstance.prototype.debug =
LoggerInstance.prototype.$$DEBUG = function() {
  if (!this.config.logWriter.isDebugEnabled()) return;
  var message = util.format.apply(this, arguments);
  var array = Array.prototype.slice.call(arguments);
  this.config.log('debug', this.context, this.component, message, array);
}

LoggerInstance.prototype.trace = 
LoggerInstance.prototype.$$TRACE = function() {
  if (!this.config.logWriter.isTraceEnabled()) return;
  var message = util.format.apply(this, arguments);
  var array = Array.prototype.slice.call(arguments);
  this.config.log('trace', this.context, this.component, message, array);
}
