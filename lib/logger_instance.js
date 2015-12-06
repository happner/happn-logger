module.exports = LoggerInstance;

var util = require('util');

function LoggerInstance(config, context, component) {
  Object.defineProperty(this, 'config', {
    get: function() {
      return config
    }
  });
  Object.defineProperty(this, 'thisContext', {value: context});
  Object.defineProperty(this, 'component', {value: component});

  Object.defineProperty(this, 'context', {
    set: function(v) {
      this.thisContext.value = v;
    },
    get: function() {
      return this.thisContext.value;
    },
    enumerable: true
  });

  this.createLogger = this.createLogger;
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
  return new LoggerInstance(this.config, this.thisContext, component);
}

LoggerInstance.prototype.fatal = function() {
  if (!this.config.logWriter) return;
  if (!this.config.logWriter.isFatalEnabled()) return;
  var array, message = util.format.apply(this, arguments);
  if (this.config.logStackTraces) array = Array.prototype.slice.call(arguments);
  this.config.log('fatal', this.thisContext.value, this.component, message, array);
}

LoggerInstance.prototype.error = function() {
  if (!this.config.logWriter) return;
  if (!this.config.logWriter.isErrorEnabled()) return;
  var array, message = util.format.apply(this, arguments);
  if (this.config.logStackTraces) array = Array.prototype.slice.call(arguments);
  this.config.log('error', this.thisContext.value, this.component, message, array);
}

LoggerInstance.prototype.warn = function() {
  if (!this.config.logWriter) return;
  if (!this.config.logWriter.isWarnEnabled()) return;
  var array, message = util.format.apply(this, arguments);
  if (this.config.logStackTraces) array = Array.prototype.slice.call(arguments);
  this.config.log('warn', this.thisContext.value, this.component, message, array);
}

LoggerInstance.prototype.info = function() {
  if (!this.config.logWriter) return;
  if (!this.config.logWriter.isInfoEnabled()) return;
  var array, message = util.format.apply(this, arguments);
  if (this.config.logStackTraces) array = Array.prototype.slice.call(arguments);
  this.config.log('info', this.thisContext.value, this.component, message, array);
}

LoggerInstance.prototype.log =
LoggerInstance.prototype.debug =
LoggerInstance.prototype.$$DEBUG = function() {
  if (!this.config.logWriter) return;
  if (!this.config.logWriter.isDebugEnabled()) return;
  var array, message = util.format.apply(this, arguments);
  if (this.config.logStackTraces) array = Array.prototype.slice.call(arguments);
  this.config.log('debug', this.thisContext.value, this.component, message, array);
}

LoggerInstance.prototype.trace = 
LoggerInstance.prototype.$$TRACE = function() {
  if (!this.config.logWriter) return;
  if (!this.config.logWriter.isTraceEnabled()) return;
  var array, message = util.format.apply(this, arguments);
  if (this.config.logStackTraces) array = Array.prototype.slice.call(arguments);
  this.config.log('trace', this.thisContext.value, this.component, message, array);
}
