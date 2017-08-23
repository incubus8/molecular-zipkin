
module.exports = {
  name: 'lists',

  actions: {
    all: {
      cache: true,
      handler() {
        console.log('call me into here');
        return {name: 'Bob'};
      }
    }
  },

  methods: {
  }

};
