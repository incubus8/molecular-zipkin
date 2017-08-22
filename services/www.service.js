const { MoleculerError } = require("moleculer").Errors;
const express = require("express");

module.exports = {
  name: "www",

  settings: {
    port: process.env.PORT || 3000,
  },

  methods: {
  },

  created() {
    const app = express();

    this.app = app;
  },

  started() {
    this.app.listen(Number(this.settings.port), err => {
      if (err) {
        return this.broker.fatal(err);
      }

      this.logger.info(`WWW server started on port ${this.settings.PORT}`);
    });
  },

  stopped() {
    if (this.app.listening) {
      this.app.close(err => {
        if (err) {
          return this.logger.error("WWW server close error!", err);
        }

        this.logger.info("WWW server stopped!");
      });
    }
  }
};
