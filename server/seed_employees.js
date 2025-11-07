// seed_employees.js
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const employeesFile = path.join(__dirname, 'data', 'employees.json');
const employees = fs.existsSync(employeesFile) ? JSON.parse(fs.readFileSync(employeesFile)) : [];

(async ()=>{
  const plain = 'EmpPass!23'; // change before handin
  const hash = await bcrypt.hash(plain, 12);
  const emp = { id: uuidv4(), username: 'employee1', password_hash: hash, fullname: 'Bank Employee One' };

  // avoid duplicates
  if (!employees.find(e=>e.username===emp.username)) {
    employees.push(emp);
    fs.writeFileSync(employeesFile, JSON.stringify(employees, null, 2));
    console.log('Seeded employee:', emp.username, 'password:', plain);
  } else {
    console.log('Employee already seeded');
  }
})();
