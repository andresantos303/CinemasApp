// verify_api.js (No external dependencies)
const USERS_API = "http://localhost:3001";
const MOVIES_API = "http://localhost:3002";

async function request(url, method = "GET", body = null, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const match = url.match(/^(http:\/\/[^/]+)(.*)$/);
  // console.log(`DEBUG: ${method} ${url}`);

  try {
    const response = await fetch(url, options);
    // console.log(`DEBUG: Status ${response.status}`);
    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.indexOf("application/json") !== -1) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new Error(
        `Request failed (${response.status}): ${JSON.stringify(data)}`
      );
    }
    return data;
  } catch (error) {
    throw error;
  }
}

async function runVerification() {
  console.log("🚀 Starting Verification (Fetch Mode)...");

  // 1. Register User
  const testUser = {
    name: "Test User",
    email: `test_${Date.now()}@example.com`,
    password: "password123",
  };

  let userId;
  let token = null;

  try {
    console.log("\n--- Testing Public Routes ---");

    console.log(`1. Registering user ${testUser.email}...`);
    await request(`${USERS_API}/users`, "POST", testUser);
    console.log("✅ Registration Successful");

    console.log("2. Logging in...");
    const loginData = await request(`${USERS_API}/auth/login`, "POST", {
      email: testUser.email,
      password: testUser.password,
    });
    console.log("✅ Login Successful. Token received.");
    token = loginData.token;
    userId = loginData.user.id;

    console.log("3. Getting User Profile...");
    const profile = await request(
      `${USERS_API}/users/${userId}`,
      "GET",
      null,
      null
    ); // Public or Auth? Routes say public for now but let's see. logic was: public?
    console.log("✅ Profile Access Successful:", profile.email);

    console.log("4. Listing Users (Filter by role)...");
    const users = await request(`${USERS_API}/users?role=user`, "GET");
    console.log(`✅ List Users Successful. Found ${users.length} users.`);
  } catch (error) {
    console.error("❌ Error in User Flow:", error.message);
  }

  try {
    console.log("\n--- Testing Movies Public Routes ---");
    console.log("5. Listing Movies...");
    const movies = await request(`${MOVIES_API}/movies`, "GET");
    console.log(`✅ List Movies Successful. Found ${movies.length} movies.`);

    // Test Filters
    console.log("6. Listing Movies with Filter (year=1999)...");
    // Note: Unless we seeded a 1999 movie, this might modify output if 0 found. But valid.
    const filteredMovies = await request(
      `${MOVIES_API}/movies?year=1999`,
      "GET"
    );
    console.log(
      `✅ Filtered List Successful. Found ${filteredMovies.length} movies.`
    );
  } catch (error) {
    console.error("❌ Error in Movie Flow:", error.message);
  }

  console.log("\n--- Verification Complete ---");
}

runVerification();
