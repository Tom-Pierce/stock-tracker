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
  });

  it("should respond 201 after creating a new position for the user", async () => {
    const res = await request(app)
      .post("/api/portfolio/position")
      .send({
        ticker: "RKLB",
      })
      .set("Cookie", cookies);

    expect(res.status).toEqual(201);
    expect(res.body.message).toEqual("position created");
  });

  it("should respond 400 if an invalid ticker is sent", async () => {
    const res = await request(app)
      .post("/api/portfolio/position")
      .send({
        ticker: "NotARealTicker",
      })
      .set("Cookie", cookies);

    expect(res.status).toEqual(400);
    expect(res.body).toContainEqual(
      expect.stringContaining("Please provide a valid stock ticker")
    );
  });

  it("should respond 409 if a duplicate ticker is sent", async () => {
    const res = await request(app)
      .post("/api/portfolio/position")
      .send({
        ticker: "rklb",
      })
      .set("Cookie", cookies);

    expect(res.status).toEqual(409);
    expect(res.body.message).toEqual(
      "Cannot create duplicate positions of the same stock"
    );
  });

  it("should respond with the position data of all tickers", async () => {
    const res = await request(app)
      .get("/api/portfolio/position")
      .set("Cookie", cookies);

    expect(res.status).toEqual(200);
    expect(res.body.positions[0]).toMatchObject({
      ticker: "RKLB",
      lots: [],
      value: 0,
    });
    expect(res.body.positions.length).toEqual(1);
  });

  it("should respond with 404 if position does not exist", async () => {
    const res = await request(app)
      .get("/api/portfolio/position/aapl")
      .set("Cookie", cookies);

    expect(res.status).toEqual(404);
    expect(res.body.message).toEqual(
      "User does not have a position for that stock"
    );
  });
});
