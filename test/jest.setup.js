const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

// setup and teardown of mongodb memory server

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
