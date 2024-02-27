const request = require("supertest");
const app = require("../app");
const User = require("../models/User");
const Position = require("../models/Position");

describe("Positions tests", () => {
  let cookies;
  let lotId;

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

    // set lot id for removal test later
    lotId = res.body.position.lots[0]._id;

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

  it("should remove the specified lot", async () => {
    const res = await request(app)
      .delete(`/api/portfolio/position/rklb/lot/${lotId}`)
      .set("Cookie", cookies);

    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual("lot removed");
  });

  it("should not allow removal of a lot when the position does not exist", async () => {
    const res = await request(app)
      .delete(`/api/portfolio/position/aapl/lot/${lotId}`)
      .set("Cookie", cookies);

    expect(res.status).toEqual(404);
    expect(res.body.message).toEqual("position not found");
  });
});
