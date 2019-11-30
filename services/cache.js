const mongoose = require("mongoose");
const redis = require("redis");
const util = require("util");
const redisUrl = "redis://localhost:6379";
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function() {
  this.useCache = true;
  console.log("this is cache");
  return this;
};
mongoose.Query.prototype.exec = async function() {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }
  const key = JSON.stringify({
    ...this.getQuery().id,
    collection: this.mongooseCollection.name
  });

  const cacheValue = await client.get(key);
  if (cacheValue) {
    const docs = JSON.parse(cacheValue);
    return Array.isArray(docs)
      ? docs.map(doc => new this.model(doc))
      : new this.model(docs);
  }
  const result = await exec.apply(this, arguments);
  client.set(key, JSON.stringify(result));
  return result;
};
