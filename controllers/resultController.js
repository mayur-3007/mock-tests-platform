const pool = require('../db')

exports.submitResult = async (req, res) => {
  const { userId, testId, answers } = req.body

  try {
    const [submittedResult] = await pool.query(
      'SELECT id FROM results WHERE user_id = ? and test_id = ?',
      [userId, testId]
    )

    if (submittedResult.length > 0)
      return res.status(404).json({ error: 'Test is aleady submitted' })

    // Retrieve the test questions
    const [[test]] = await pool.query(
      'SELECT question_ids FROM tests WHERE id = ?',
      [testId]
    )
    const questionIds = test.question_ids

    // Fetch all questions for the test
    const [questions] = await pool.query(
      'SELECT id, type, answer FROM questions WHERE id IN (?)',
      [questionIds]
    )

    let score = 0
    const details = questionIds.map((questionId) => {
      const question = questions.find((q) => q.id === questionId)
      const userAnswer = answers[questionId]

      let isCorrect = false

      if (question.type === 'match') {
        isCorrect =
          JSON.stringify(question.answer) ===
          JSON.stringify(JSON.parse(userAnswer))
      } else {
        isCorrect =
          JSON.stringify(userAnswer.toLowerCase()) ===
          JSON.stringify(question.answer.toLowerCase())
      }

      if (isCorrect) score += 1

      return { questionId, isCorrect }
    })

    // Store result in the database
    const [result] = await pool.query(
      'INSERT INTO results (user_id, test_id, answers, score, details) VALUES (?, ?, ?, ?, ?)',
      [userId, testId, JSON.stringify(answers), score, JSON.stringify(details)]
    )
    res.status(201).json({ id: result.insertId, score, details })
  } catch (error) {
    console.log(error, '----------submit result')
    res.status(500).json({ error: 'Failed to submit result' })
  }
}

// View test results
exports.getUserResults = async (req, res) => {
  const { userId, testId } = req.params

  try {
    // Retrieve the result for the specific user and test
    const [results] = await pool.query(
      'SELECT * FROM results WHERE user_id = ? AND test_id = ?',
      [userId, testId]
    )

    if (results.length === 0) {
      return res.status(404).json({ message: 'No results found' })
    }

    // Parse the answers and details from the result
    const result = results[0]
    const answers = result.answers
    const details = result.details

    // Fetch the question details from the questions table
    const [questions] = await pool.query(
      'SELECT id, content, type, options, answer FROM questions WHERE id IN (?)',
      [details.map((detail) => detail.questionId)]
    )

    const formattedQuestions = questions.map((question) => {
      const userAnswer = answers[question.id]
      const isCorrect = details.find(
        (d) => d.questionId === question.id
      ).isCorrect
      return {
        questionName: question.content,
        options: question.options ? question.options : null, // Only for MCQ or match-type
        userAnswer: userAnswer,
        correctAnswer: question.answer,
        isCorrect: isCorrect,
      }
    })

    res.status(200).json({
      totalScore: result.score,
      totalQuestions: questions.length,
      questions: formattedQuestions,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to retrieve results' })
  }
}
