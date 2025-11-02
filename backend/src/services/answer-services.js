const genericHelper = require("../helper-functions/generic-helper");
const { pool } = require("./database");

class AnswerService {
  async createAnswer(data) {
    try {
      console.log(`Creating answer...`);
      console.log(data);

      // Real DB query - matches your ERD
      const [result] = await pool.execute(
        `INSERT INTO Answer (body, question_id, user_id, is_anonymous)
                 VALUES (?, ?, ?, ?)`,
        [data.body, data.question_id, data.user_id, data.is_anonymous || false],
      );

      // Get the created answer with joins
      const [answers] = await pool.execute(
        `SELECT a.answer_id, a.body, a.is_accepted, a.score, a.created_at, a.updated_at, a.is_anonymous,
                        u.user_id, u.first_name, u.last_name,
                        q.question_id, q.title
                 FROM Answer a
                 JOIN User u ON a.user_id = u.user_id
                 JOIN Question q ON a.question_id = q.question_id
                 WHERE a.answer_id = ?`,
        [result.insertId],
      );

      if (answers.length === 0) {
        throw new Error("Failed to create answer");
      }

      const answer = answers[0];
      const voteCounts = await this.getVoteCounts(answer.answer_id);

      return {
        answerId: answer.answer_id,
        content: answer.body,
        is_accepted: answer.is_accepted,
        score: answer.score,
        created_at: answer.created_at,
        updated_at: answer.updated_at,
        questionId: answer.question_id,
        userId: answer.user_id,
        user_firstname: answer.first_name,
        isAnonymous: answer.is_anonymous,
        upVotes: voteCounts.upVotes,
        downVotes: voteCounts.downVotes,
      };
    } catch (err) {
      console.error("Error creating answer:", err);
      throw new Error(err.message);
    }
  }

  async getOneAnswer(data) {
    try {
      console.log(`Getting one answer...`);

      const [answers] = await pool.execute(
        `SELECT a.answer_id, a.body, a.is_accepted, a.score, a.created_at, a.updated_at, a.is_anonymous,
                        u.user_id, u.first_name, u.last_name, u.email,
                        q.question_id, q.title, q.body as question_body
                 FROM Answer a
                 JOIN User u ON a.user_id = u.user_id
                 JOIN Question q ON a.question_id = q.question_id
                 WHERE a.answer_id = ?`,
        [data.answerId],
      );

      if (answers.length === 0) {
        throw new Error("Answer ID doesn't exist!");
      }

      const answer = answers[0];
      const voteCounts = await this.getVoteCounts(answer.answer_id);

      // Get all the answer's comments
      const [answerComments] = await pool.execute(
        `SELECT a.answer_id, a.body, a.created_at,
                  u.user_id, u.first_name, u.last_name
          FROM Comment a
          JOIN User u ON a.user_id = u.user_id
          WHERE a.answer_id = ?
          ORDER BY a.created_at ASC`,
        [answer.answer_id],
      );

      return {
        answerId: answer.answer_id,
        questionId: answer.question_id,
        content: answer.body,
        is_accepted: answer.is_accepted,
        isAnonymous: answer.is_anonymous,
        score: answer.score,
        firstname: answer.first_name,
        lastname: answer.last_name,
        created_at: answer.created_at,
        updated_at: answer.updated_at,
        userId: answer.user_id,
        upVotes: voteCounts.upVotes,
        downVotes: voteCounts.downVotes,
        comments: answerComments
      };
    } catch (err) {
      console.error("Error getting answer:", err);
      throw new Error(err.message);
    }
  }

  async updateAnswer(data) {
    try {
      console.log(`Updating answer...`);

      // Check if answer exists and user owns it
      const [existing] = await pool.execute(
        "SELECT user_id FROM Answer WHERE answer_id = ?",
        [data.answerId],
      );

      if (existing.length === 0) {
        throw new Error("Answer ID doesn't exist!");
      }

      console.log(data);
      // Update the answer
      await pool.execute(
        `UPDATE Answer
                 SET body = ?, is_anonymous = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE answer_id = ?`,
        [data.content, data.is_anonymous || false, data.answerId],
      );

      // Return updated answer
      return await this.getOneAnswer({ answerId: data.answerId });
    } catch (err) {
      console.error("Error updating answer:", err);
      throw new Error(err.message);
    }
  }

  async deleteAnswer(data) {
    try {
      console.log(`Deleting answer...`);

      const [result] = await pool.execute(
        "DELETE FROM Answer WHERE answer_id = ?",
        [data.answerId],
      );

      if (result.affectedRows === 0) {
        return {
          success: false,
          message:
            "Answer not found or you don't have permission to delete it!",
        };
      }

      return {
        success: true,
        message: "Successfully deleted.",
      };
    } catch (err) {
      console.error("Error deleting answer:", err);
      throw new Error(err.message);
    }
  }

  async rateAnswer(data) {
    try {
      console.log(`Rating an answer...`);

      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Check if user already voted on this answer
        const [existingVotes] = await connection.execute(
          `SELECT vote_id, vote_type FROM Votes
                    WHERE user_id = ? AND answer_id = ? AND question_id IS NULL`,
          [data.userId, data.answerId],
        );

        const newVoteType = data.type === 1 ? "upvote" : "downvote";
        let previousVote =
          existingVotes.length > 0 ? existingVotes[0].vote_type : null;

        // Insert, delete, or update vote
        if (!previousVote) {
          // No existing vote → add new
          await connection.execute(
            `INSERT INTO Votes (vote_type, user_id, answer_id)
                        VALUES (?, ?, ?)`,
            [newVoteType, data.userId, data.answerId],
          );
        } else if (previousVote === newVoteType) {
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
            `INSERT INTO Votes (vote_type, user_id, answer_id)
                        VALUES (?, ?, ?)`,
            [newVoteType, data.userId, data.answerId],
          );
        }

        // Commit transaction
        await connection.commit();

        // Get the updated answer score and vote counts
        const [answer] = await connection.execute(
          "SELECT score FROM Answer WHERE answer_id = ?",
          [data.answerId],
        );

        const voteCounts = await this.getVoteCounts(data.answerId);

        return {
          answer_id: data.answerId,
          up_votes: voteCounts.upVotes,
          down_votes: voteCounts.downVotes,
          score: answer[0].score,
        };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error("Error rating answer:", error);
      throw error;
    }
  }

  // Helper
  async getVoteCounts(answerId) {
    const [votes] = await pool.execute(
      `SELECT
            COUNT(CASE WHEN vote_type = 'upvote' THEN 1 END) as up_votes,
            COUNT(CASE WHEN vote_type = 'downvote' THEN 1 END) as down_votes
         FROM Votes
         WHERE answer_id = ? AND question_id IS NULL`,
      [answerId],
    );

    return {
      upVotes: votes[0].up_votes,
      downVotes: votes[0].down_votes,
    };
  }

  async generateAnswer(data) {
    try {
      console.log(`AI generating answer...`);

      // Generate an answer
      const response = await genericHelper.getAIResponse(data);

      // Insert the answer to table under the first user
      data.body = response.text;
      data["user_id"] = 1; // Should be replaced with AI user id.
      data["is_anonymous"] = false;

      return await this.createAnswer(data);
    } catch (err) {
      console.error("Error creating answer:", err);
      throw new Error(err.message);
    }
  }
}

module.exports = new AnswerService();
