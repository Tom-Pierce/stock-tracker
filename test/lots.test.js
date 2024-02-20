const request = require("supertest");
const app = require("../app");
const User = require("../models/User");
const Position = require("../models/Position");

describe("Positions tests", () => {
  let cookies;

  beforeAll(async () => {
    // clear database from previous tests
    await User.deleteMany({}).exec();
    await Position.deleteMany({}).exec();

    // signup to get access token
    const res = await request(app).post("/api/auth/local/signup").send({
      email: "example@gmail.com",
      password: "ThisIsAPassword123",
      confirmPassword: "ThisIsAPassword123",
    });

    cookies = res.header["set-cookie"];

    // create position to add lots to
    await request(app)
      .post("/api/portfolio/position")
      .send({
        ticker: "RKLB",
      })
      .set("Cookie", cookies);
  });

  it("should respond 201 after adding a new lot to a position", async () => {
    const res = await request(app)
      .post("/api/portfolio/position/rklb/lot")
      .send({
        quantity: 100,
        price: 4.89,
      })
      .set("Cookie", cookies);

    expect(res.status).toEqual(201);
    expect(res.body.message).toEqual("Lot added to position");
  });

  it("should respond 400 if a position that has not been created is accessed", async () => {
    const res = await request(app)
      .post("/api/portfolio/position/aapl/lot")
      .send({
        quantity: 50,
        price: 180.65,
      })
      .set("Cookie", cookies);

    expect(res.status).toEqual(400);
    expect(res.body.message).toEqual(
      "User does not have a position with that stock"
    );
  });
});
