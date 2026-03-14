const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

app.get('/api/employees', (req, res) => {
  const { search, department, sort = 'id', order = 'asc', page = 1 } = req.query;
  const limit = 5;
  const offset = (page - 1) * limit;

  const allowedSort = ['id', 'name', 'department', 'position', 'hire_date', 'salary'];
  const sortCol = allowedSort.includes(sort) ? sort : 'id';
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

  let query = 'SELECT * FROM employees WHERE 1=1';
  let countQuery = 'SELECT COUNT(*) as total FROM employees WHERE 1=1';
  const params = [];

  if (search) {
    const filter = ' AND (name LIKE ? OR position LIKE ? OR email LIKE ?)';
    query += filter;
    countQuery += filter;
    const like = `%${search}%`;
    params.push(like, like, like);
  }

  if (department && department !== 'all') {
    const filter = ' AND department = ?';
    query += filter;
    countQuery += filter;
    params.push(department);
  }

  query += ` ORDER BY ${sortCol} ${sortOrder} LIMIT ? OFFSET ?`;
  
  const total = db.prepare(countQuery).get(...params).total;
  const employees = db.prepare(query).all(...params, limit, offset);
  
  res.json({ employees, total, totalPages: Math.ceil(total / limit) });
});
app.get('/api/departments', (req, res) => {
  const departments = db.prepare('SELECT DISTINCT department FROM employees ORDER BY department').all();
  res.json(departments.map(d => d.department));
});

app.post('/api/employees', (req, res) => {
  const { name, department, position, email, phone, hire_date, salary } = req.body;
  const stmt = db.prepare(`
    INSERT INTO employees (name, department, position, email, phone, hire_date, salary)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(name, department, position, email, phone, hire_date, salary);
  res.status(201).json({ id: result.lastInsertRowid });
});

app.put('/api/employees/:id', (req, res) => {
  const { name, department, position, email, phone, hire_date, salary } = req.body;
  try {
    const stmt = db.prepare(`
      UPDATE employees 
      SET name = ?, department = ?, position = ?, email = ?, phone = ?, hire_date = ?, salary = ?
      WHERE id = ?
    `);
    stmt.run(name, department, position, email, phone, hire_date, salary, req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/employees/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM employees WHERE id = ?').run(id);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/salary-by-department', (req, res) => {
  try {
    const data = db.prepare(`
      SELECT department, SUM(salary) as total 
      FROM employees 
      GROUP BY department
    `).all();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats', (req, res) => {
  const stats = db.prepare('SELECT COUNT(*) as total, AVG(salary) as avgSalary FROM employees').get();
  res.json(stats);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
