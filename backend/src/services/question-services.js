const { pool } = require("./database");
const answerService = require("./answer-services");
const tagService = require("./tag-services");

class QuestionService {
  async createQuestion(data) {
    const connection = await pool.getConnection();
    try {
      console.log(`Creating question...`);
      await connection.beginTransaction();

      // 1️⃣ Create question itself
      const [result] = await connection.execute(
        `INSERT INTO Question (title, body, user_id, course_id, is_anonymous)
                 VALUES (?, ?, ?, ?, ?)`,
        [
          data.title,
          data.content,
          data.userId,
          data.courseId,
          data.isAnonymous || false,
        ],
      );

      const questionId = result.insertId;

      // 2️⃣ Process tags (if provided)
      if (data.tags && Array.isArray(data.tags)) {
        console.log("Processing tags:", data.tags);
        for (const rawTagName of data.tags) {
          const tagName = rawTagName.trim().toLowerCase(); // normalize to prevent duplicates like "JS" vs "js"
          let tagId = await tagService.isTag(tagName);

          if (!tagId) {
            tagId = await tagService.createTag(tagName);
          }

          await connection.execute(
            `INSERT INTO QuestionTag (question_id, tag_id) VALUES (?, ?)`,
            [questionId, tagId],
          );
        }
      }

      // 3️⃣ Get question info with joins
      const [questions] = await connection.execute(
        `SELECT q.question_id, q.title, q.body, q.view_count, q.score, q.created_at, q.updated_at, q.is_anonymous,
                        u.user_id, u.first_name, u.last_name,
                        c.course_id, c.name
                 FROM Question q
                 JOIN User u ON q.user_id = u.user_id
                 JOIN Course c ON q.course_id = c.course_id
                 WHERE q.question_id = ?`,
        [questionId],
      );

      if (questions.length === 0) throw new Error("Failed to create question");
      const question = questions[0];

      // 4️⃣ Get tag names to return in response
      const [tags] = await connection.execute(
        `SELECT t.tag_id, t.name
                 FROM Tag t
                 JOIN QuestionTag qt ON t.tag_id = qt.tag_id
                 WHERE qt.question_id = ?`,
        [questionId],
      );
      await connection.commit();
      connection.release();

      // 5️⃣ Optional AI answer generation
      const aiAnswerData = {
        body: question.body,
        question_id: question.question_id,
        user_id: 1,
        is_anonymous: false,
      };
      question["answers"] = [await answerService.generateAnswer(aiAnswerData)];

      await connection.commit();

      return {
        questionId: question.question_id,
        title: question.title,
        content: question.body,
        userId: question.user_id,
        courseId: question.course_id,
        viewCount: question.view_count,
        score: question.score,
        isAnonymous: Boolean(question.is_anonymous),
        createdAt: question.created_at,
        updatedAt: question.updated_at,
        tags: tags.map((t) => ({ tagId: t.tag_id, name: t.name })),
        answers: question.answers,
      };
    } catch (err) {
      await connection.rollback();
      console.error("Error creating question:", err);
      throw new Error(err.message);
    } finally {
      connection.release();
    }
  }
  async getSingleQuestion(data) {
    try {
      console.log(`Getting a question with all answers...`);

      // Get the question
      const [questions] = await pool.execute(
        `SELECT q.question_id, q.title, q.body, q.view_count, q.score, q.created_at, q.updated_at, q.is_anonymous,
                        u.user_id, u.first_name, u.last_name, u.email,
                        c.course_id, c.name,
                        GROUP_CONCAT(DISTINCT t.name) AS tags
                 FROM Question q
                 JOIN User u ON q.user_id = u.user_id
                 JOIN Course c ON q.course_id = c.course_id
                 LEFT JOIN QuestionTag qt ON q.question_id = qt.question_id
                 LEFT JOIN Tag t ON qt.tag_id = t.tag_id
                 WHERE q.question_id = ?
                 GROUP BY q.question_id`,
        [data.questionId],
      );

      if (questions.length === 0) {
        throw new Error("Question ID doesn't exist!");
      }

      const question = questions[0];

      // Increment view count
      await pool.execute(
        "UPDATE Question SET view_count = view_count + 1 WHERE question_id = ?",
        [data.questionId],
      );

      // Get all answers for this question
      const [answers] = await pool.execute(
        `SELECT a.answer_id, a.body, a.is_accepted, a.score, a.created_at, a.updated_at, a.is_anonymous,
                        u.user_id, u.first_name, u.last_name
                 FROM Answer a
                 JOIN User u ON a.user_id = u.user_id
                 WHERE a.question_id = ?
                 ORDER BY a.is_accepted DESC, a.score DESC, a.created_at ASC`,
        [data.questionId],
      );

      // Get all comments for this question
      const [comments] = await pool.execute(
        `SELECT a.comment_id, a.question_id, a.body, a.created_at,
                        u.user_id, u.first_name, u.last_name
                 FROM Comment a
                 JOIN User u ON a.user_id = u.user_id
                 WHERE a.question_id = ?
                 ORDER BY a.created_at ASC`,
        [data.questionId],
      );

      // Get vote counts for question and answers
      const questionVoteCounts = await this.getVoteCounts(question.question_id);

      const answersWithVotes = await Promise.all(
        answers.map(async (answer) => {
          const answerVoteCounts = await this.getVoteCounts(answer.answer_id);

          // Get all the answer's comments
          const [answerComments] = await pool.execute(
            `SELECT a.answer_id, a.body, a.created_at, a.comment_id,
                                                    u.user_id, u.first_name, u.last_name
                                            FROM Comment a
                                            JOIN User u ON a.user_id = u.user_id
                                            WHERE a.answer_id = ?
                                            ORDER BY a.created_at ASC`,
            [answer.answer_id],
          );
          console.log(answerComments);
          return {
            answerId: answer.answer_id,
            content: answer.body,
            isAccepted: Boolean(answer.is_accepted),
            score: answer.score,
            createdAt: answer.created_at,
            updatedAt: answer.updated_at,
            firstname: answer.first_name,
            lastname: answer.last_name,
            userId: answer.user_id,
            isAnonymous: Boolean(answer.is_anonymous),
            upVotes: answerVoteCounts.upVotes,
            downVotes: answerVoteCounts.downVotes,
            comments: answerComments,
          };
        }),
      );

      return {
        questionId: question.question_id,
        title: question.title,
        content: question.body,
        userId: question.user_id,
        courseId: question.course_id,
        viewCount: question.view_count + 1, // Include the +1 we just added
        score: question.score,
        isAnonymous: Boolean(question.is_anonymous),
        createdAt: question.created_at,
        firstname: question.first_name,
        lastname: question.last_name,
        updatedAt: question.updated_at,
        tags: question.tags
          ? question.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        upVotes: questionVoteCounts.upVotes,
        downVotes: questionVoteCounts.downVotes,
        answers: answersWithVotes,
        comments: comments,
      };
    } catch (err) {
      console.error("Error getting question:", err);
      throw new Error(err.message);
    }
  }

  async getAllQuestions(searchFilter = "") {
    try {
      console.log(`Get all questions with optional search filter...`);

      let query = `
                SELECT q.question_id, q.title, q.body, q.view_count, q.score, q.created_at, q.updated_at, q.is_anonymous,
                       u.user_id, u.first_name, u.last_name,
                       c.course_id, c.name,
                       COUNT(a.answer_id) as answer_count,
                       GROUP_CONCAT(DISTINCT t.name) AS tags
                FROM Question q
                JOIN User u ON q.user_id = u.user_id
                JOIN Course c ON q.course_id = c.course_id
                LEFT JOIN Answer a ON q.question_id = a.question_id
                LEFT JOIN QuestionTag qt ON q.question_id = qt.question_id
                LEFT JOIN Tag t ON qt.tag_id = t.tag_id
            `;

      const params = [];

      if (searchFilter) {
        query += ` WHERE q.title LIKE ? OR q.body LIKE ?`;
        params.push(`%${searchFilter}%`, `%${searchFilter}%`);
      }

      query += ` GROUP BY q.question_id ORDER BY q.created_at DESC`;

      const [questions] = await pool.execute(query, params);

      const questionsWithVotes = await Promise.all(
        questions.map(async (question) => {
          const voteCounts = await this.getVoteCounts(question.question_id);
          return {
            questionId: question.question_id,
            title: question.title,
            content: question.body,
            userId: question.user_id,
            courseId: question.course_id,
            viewCount: question.view_count,
            score: question.score,
            firstname: question.first_name,
            lastname: question.last_name,
            isAnonymous: Boolean(question.is_anonymous),
            createdAt: question.created_at,
            updatedAt: question.updated_at,
            answerCount: question.answer_count,
            tags: question.tags
              ? question.tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
              : [],
            upVotes: voteCounts.upVotes,
            downVotes: voteCounts.downVotes,
          };
        }),
      );

      return questionsWithVotes;
    } catch (err) {
      console.error("Error getting all questions:", err);
      throw new Error(err.message);
    }
  }

  async updateQuestion(data) {
    try {
      console.log(`Updating the question...`);

      const [existing] = await pool.execute(
        "SELECT user_id FROM Question WHERE question_id = ?",
        [data.questionId],
      );

      if (existing.length === 0) {
        throw new Error("Question ID doesn't exist!");
      }

      await pool.execute(
        `UPDATE Question
                 SET title = ?, body = ?, is_anonymous = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE question_id = ?`,
        [data.title, data.content, data.isAnonymous || false, data.questionId],
      );

      return await this.getSingleQuestion({ questionId: data.questionId });
    } catch (err) {
      console.error("Error updating question:", err);
      throw new Error(err.message);
    }
  }

  async deleteQuestion(data) {
    try {
      console.log(`Deleting the question...`);

      const [result] = await pool.execute(
        "DELETE FROM Question WHERE question_id = ?",
        [data.questionId],
      );

      if (result.affectedRows === 0) {
        return {
          success: false,
          message:
            "Question not found or you don't have permission to delete it!",
        };
      }

      return {
        success: true,
        message: "Successfully deleted.",
      };
    } catch (err) {
      console.error("Error deleting question:", err);
      throw new Error(err.message);
    }
  }

  async rateQuestion(data) {
    try {
      console.log(`Rating a question...`);

      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Check if user already voted on this question
        const [existingVotes] = await connection.execute(
          `SELECT vote_id, vote_type FROM Votes
                 WHERE user_id = ? AND question_id = ? AND answer_id IS NULL`,
          [data.userId, data.questionId],
        );

        const voteType = data.type === 1 ? "upvote" : "downvote";

        if (existingVotes.length === 0) {
          // No existing vote → add new
          await connection.execute(
            `INSERT INTO Votes (vote_type, user_id, question_id)
                     VALUES (?, ?, ?)`,
            [voteType, data.userId, data.questionId],
          );
        } else if (existingVotes[0].vote_type === voteType) {
          // Same vote → toggle off (remove)
          await connection.execute("DELETE FROM Votes WHERE vote_id = ?", [
            existingVotes[0].vote_id,
          ]);
        } else {
          // Switch vote type
          await connection.execute("DELETE FROM Votes WHERE vote_id = ?", [
            existingVotes[0].vote_id,
          ]);

          await connection.execute(
            `INSERT INTO Votes (vote_type, user_id, question_id)
                     VALUES (?, ?, ?)`,
            [voteType, data.userId, data.questionId],
          );
        }

        await connection.commit();

        // Get the updated question score and vote counts
        const [question] = await connection.execute(
          "SELECT score FROM Question WHERE question_id = ?",
          [data.questionId],
        );

        const voteCounts = await this.getVoteCounts(
          data.questionId,
          "question",
        );

        return {
          question_id: data.questionId,
          up_votes: voteCounts.upVotes,
          down_votes: voteCounts.downVotes,
          score: question[0].score,
        };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error("Error rating question:", error);
      throw error;
    }
  }

  // Helper method to get vote counts for both questions and answers
  async getVoteCounts(entityId) {
    const [votes] = await pool.execute(
      `SELECT
                COUNT(CASE WHEN vote_type = 'upvote' THEN 1 END) as up_votes,
                COUNT(CASE WHEN vote_type = 'downvote' THEN 1 END) as down_votes
             FROM Votes
             WHERE (question_id = ? OR answer_id = ?)`,
      [entityId, entityId],
    );

    return {
      upVotes: votes[0].up_votes,
      downVotes: votes[0].down_votes,
    };
  }
}

module.exports = new QuestionService();
