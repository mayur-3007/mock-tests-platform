const pool = require('../db')

// Create a single question
exports.createQuestion = async (req, res) => {
  const { type, content, options, answer } = req.body
  try {
    const [result] = await pool.query(
      'INSERT INTO questions (type, content, options, answer) VALUES (?, ?, ?, ?)',
      [type, content, JSON.stringify(options), JSON.stringify(answer)]
    )
    res.status(201).json({ id: result.insertId })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create question' })
  }
}

// Create multiple questions
exports.createMultipleQuestions = async (req, res) => {
  const questions = req.body
  try {
    const createdQuestions = await Promise.all(
      questions.map(async (question) => {
        const { type, content, options, answer } = question
        const [result] = await pool.query(
          'INSERT INTO questions (type, content, options, answer) VALUES (?, ?, ?, ?)',
          [type, content, JSON.stringify(options), JSON.stringify(answer)]
        )
        return { id: result.insertId, ...question }
      })
    )
    res.status(201).json(createdQuestions)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create multiple questions' })
  }
}

// Get a question by ID
exports.getQuestionById = async (req, res) => {
  const { id } = req.params
  try {
    const [questions] = await pool.query(
      'SELECT * FROM questions WHERE id = ?',
      [id]
    )
    if (questions.length === 0)
      return res.status(404).json({ error: 'Question not found' })
    res.json(questions[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve question' })
  }
}

// Get all questions
exports.getAllQuestions = async (req, res) => {
  try {
    const [questions] = await pool.query('SELECT * FROM questions')
    res.json(questions)
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve questions' })
  }
}
