// Const {MoleculerError} = require('moleculer').Errors;
const express = require('express');

const {BatchRecorder, Tracer} = require('zipkin');
const {HttpLogger} = require('zipkin-transport-http');
const CLSContext = require('zipkin-context-cls');
const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;

module.exports = {
  name: 'www',

  settings: {
    port: 3030
  },

  methods: {
    initRoutes(app) {
      app.get('/api/v1/lists', this.allLists);
    },

    allLists(req, res) {
      const page = Number(req.query.page || 1);
      return Promise.resolve({page})
        .then(() => {
          return this.broker.call('lists.all', {})
            .then(listData => {
              res.json(listData);
            });
        });
    },

    zipkinTracer() {
      // Send spans to Zipkin asynchronously over HTTP
      const zipkinBaseUrl = 'http://localhost:9411';
      const recorder = new BatchRecorder({
        logger: new HttpLogger({
          endpoint: `${zipkinBaseUrl}/api/v1/spans`
        })
      });

      const ctxImpl = new CLSContext('zipkin');
      const tracer = new Tracer({ctxImpl, recorder});

      return tracer;
    }
  },

  created() {
    const app = express();

    this.logger.info('WWWW created express app');

    // Middlewares
    app.use(zipkinMiddleware({
      tracer: this.zipkinTracer(),
      serviceName: 'www' // Name of this application
    }));

    this.initRoutes(app);

    this.app = app;
  },

  started() {
    this.app.listen(Number(this.settings.port), err => {
      if (err) {
        return this.broker.fatal(err);
      }

      this.logger.info(`WWW server started on port ${this.settings.port}`);
    });
  },

  stopped() {
    if (this.app.listening) {
      this.app.close(err => {
        if (err) {
          return this.logger.error('WWW server close error!', err);
        }

        this.logger.info('WWW server stopped!');
      });
    }
  }
};
