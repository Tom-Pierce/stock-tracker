const request = require("supertest");
const app = require("../app");

describe("API tests", () => {
  it("should respond with 404 and errors if user email or password do not fit requirements", async () => {
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
});
