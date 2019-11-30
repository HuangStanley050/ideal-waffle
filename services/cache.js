const mongoose = require("mongoose");

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = function() {
  const key = { ...this.getQuery(), collection: this.mongoose.Collection.name };
  console.log(key);
  return exec.apply(this, arguments);
};
