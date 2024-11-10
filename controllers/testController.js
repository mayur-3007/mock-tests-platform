const pool = require('../db')

// Create a test
exports.createTest = async (req, res) => {
  const { name, questionIds } = req.body
  try {
    const [result] = await pool.query(
      'INSERT INTO tests (name, question_ids) VALUES (?, ?)',
      [name, JSON.stringify(questionIds)]
    )
    res.status(201).json({ testId: result.insertId })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create test' })
  }
}
