const pool = require('../db')

// Create a new user
exports.createUser = async (req, res) => {
  const { name, email } = req.body
  try {
    const [user] = await pool.query('SELECT * FROM users WHERE email = ?', [
      email,
    ])
    if (user.length > 0)
      return res.status(201).json({ err: 'Email already exists' })

    const [result] = await pool.query(
      'INSERT INTO users (name,email) VALUES (?, ?)',
      [name, email]
    )
    res.status(201).json({ id: result.insertId, name, email })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' })
  }
}

// Get a user by ID
exports.getUserById = async (req, res) => {
  const { id } = req.params
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id])
    if (users.length === 0)
      return res.status(404).json({ error: 'User not found' })
    res.json(users[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve user' })
  }
}

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT * FROM users')
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve users' })
  }
}
