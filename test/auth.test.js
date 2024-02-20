const request = require("supertest");
const app = require("../app");
const User = require("../models/User");

describe("API tests", () => {
  beforeAll(async () => {
    // clear database from previous tests
    await User.deleteMany({}).exec();
  });

  it("should respond with 400 and errors if user email or password do not fit requirements", async () => {
    const res = await request(app).post("/api/auth/local/signup").send({
      email: "thisisnotavalidemail",
      password: "pwd",
      confirmPassword: "notTheSamePwd",
    });

    expect(res.status).toEqual(400);
    expect(res.body).toEqual([
      "Please provide a valid email",
      "Password must be at least 8 characters long",
      "Password must contain an uppercase letter",
      "Password must contain a number",
      "Passwords don't match",
    ]);
  });

  it("should create a user and respond with 201 and a message", async () => {
    const res = await request(app).post("/api/auth/local/signup").send({
      email: "example@gmail.com",
      password: "ThisIsAPassword123",
      confirmPassword: "ThisIsAPassword123",
    });

    expect(res.status).toEqual(201);

    const cookies = res.headers["set-cookie"];
    expect(cookies).toContainEqual(expect.stringContaining("jwt="));
    expect(cookies).toContainEqual(expect.stringContaining("refreshToken="));
  });

  it("should respond with 400 if email is already in use", async () => {
    const res = await request(app).post("/api/auth/local/signup").send({
      email: "example@gmail.com",
      password: "ThisIsAPassword123",
      confirmPassword: "ThisIsAPassword123",
    });

    expect(res.status).toEqual(400);
    expect(res.body).toContainEqual(
      expect.stringContaining("Email is already in use")
    );
  });

  it("should respond with 401 if user attempts to login with incorrect email", async () => {
    const res = await request(app).post("/api/auth/local/login").send({
      email: "wrong@gmail.com",
      password: "ThisIsAPassword123",
    });

    expect(res.status).toEqual(401);
    expect(res.body.message).toEqual(
      "No account found with that email address"
    );
  });

  it("should respond with 401 if user attempts to login with incorrect password", async () => {
    const res = await request(app).post("/api/auth/local/login").send({
      email: "example@gmail.com",
      password: "wrongpassword",
    });

    expect(res.status).toEqual(401);
    expect(res.body.message).toEqual("Email or password incorrect");
  });
});
