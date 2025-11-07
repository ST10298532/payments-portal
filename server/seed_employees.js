// server/seed_employees.js
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const employeesFile = path.join(__dirname, "data", "employees.json");

// Read or initialize employees file safely
let employees = [];
try {
  if (fs.existsSync(employeesFile)) {
    const data = fs.readFileSync(employeesFile, "utf8");
    employees = data ? JSON.parse(data) : [];
  }
} catch (err) {
  console.error("⚠️ Error reading employees file:", err);
  employees = [];
}

(async () => {
  try {
    const plainPassword = "Emp@2025!"; // Use strong password for final build
    const hash = await bcrypt.hash(plainPassword, 12);
    const emp = {
      id: uuidv4(),
      username: "employee1",
      password_hash: hash,
      fullname: "Bank Employee One",
      role: "employee",
    };

    // Avoid duplicates
    if (!employees.find((e) => e.username === emp.username)) {
      employees.push(emp);
      fs.writeFileSync(employeesFile, JSON.stringify(employees, null, 2));
      console.log(
        "✅ Seeded employee:",
        emp.username,
        "\nTemporary password:",
        plainPassword
      );
    } else {
      console.log("ℹ️ Employee already exists, skipping seeding.");
    }
  } catch (err) {
    console.error("❌ Error seeding employee:", err);
  }
})();
