const request = require("supertest");
const app = require("./index");

describe("Authorization server", () => {
  it("should redirect user to login page", async () => {
    const response = await request(app)
      .get("/authorize")
      .query({
        response_type: "code",
        client_id: "client-id",
        redirect_uri: "http://localhost:3000/callback",
        scope: "openid email",
      })
      .expect(302);

    expect(response.header.location).toMatch("/login");
  });

  it("should render login page", async () => {
    const response = await request(app)
      .get("/login")
      .query({
        response_type: "code",
        client_id: "client-id",
        redirect_uri: "http://localhost:3000/callback",
        scope: "openid email",
      })
      .expect(200);

    expect(response.text).toContain("<form");
  });

  it("should generate authorization code after successful login", async () => {
    const response = await request(app)
      .post("/login")
      .send({
        email: "user@example.com",
        password: "password",
        response_type: "code",
        client_id: "client-id",
        redirect_uri: "http://localhost:3000/callback",
        scope: "openid email",
      })
      .expect(302);

    expect(response.header.location).toMatch(/code=.+/);
  });

  it("should exchange authorization code for access token", async () => {
    const authorizationCode = await getAuthorizationCode();

    const response = await request(app)
      .post("/token")
      .send({
        grant_type: "authorization_code",
        client_id: "client-id",
        client_secret: "client-secret",
        code: authorizationCode,
        redirect_uri: "http://localhost:3000/callback",
      })
      .expect(200);

    expect(response.body.access_token).toBeDefined();
    expect(response.body.token_type).toBe("Bearer");
    expect(response.body.id_token).toBeDefined();
    expect(response.body.expires_in).toBe(60);
  });

  it("should return user information with access token", async () => {
    const accessToken = await getAccessToken();

    const response = await request(app)
      .get("/userinfo")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.email).toBe("user@example.com");
    expect(response.body.id).toBe("user-id");
  });
});

function getAuthorizationCode() {
  return request(app)
    .post("/login")
    .send({
      email: "user@example.com",
      password: "password",
      response_type: "code",
      client_id: "client-id",
      redirect_uri: "http://localhost:3000/callback",
      scope: "openid email",
    })
    .then((response) => {
      const location = response.header.location;
      const match = location.match(/code=(.*)/);
      return match[1];
    });
}

function getAccessToken() {
  return getAuthorizationCode().then((authorizationCode) => {
    return request(app)
      .post("/token")
      .send({
        grant_type: "authorization_code",
        client_id: "client-id",
        client_secret: "client-secret",
        code: authorizationCode,
        redirect_uri: "http://localhost:3000/callback",
      })
      .then((response) => {
        return response.body.access_token;
      });
  });
}
