const { pool } = require("./database");
const genericHelper = require("../helper-functions/generic-helper");

class CommentService {
  // Create a new comment
  async createComment(data) {
    try {
      console.log("Creating comment...");
      console.log(data);

      // Validation: must target exactly one parent
      if (!data.body) throw new Error("Comment must have a body");
      const hasQuestion = !!data.question_id;
      const hasAnswer = !!data.answer_id;
      if (hasQuestion === hasAnswer) {
        throw new Error(
          "Comment must reference either a question or an answer, not both or neither",
        );
      }

      const [result] = await pool.execute(
        `INSERT INTO Comment (body, user_id, question_id, answer_id)
                 VALUES (?, ?, ?, ?)`,
        [
          data.body,
          data.user_id,
          data.question_id || null,
          data.answer_id || null,
        ],
      );

      const [rows] = await pool.execute(
        `SELECT c.comment_id, c.body, c.created_at,
                        u.user_id, u.first_name, u.last_name,
                        c.question_id, c.answer_id
                 FROM Comment c
                 JOIN User u ON c.user_id = u.user_id
                 WHERE c.comment_id = ?`,
        [result.insertId],
      );

      if (rows.length === 0) throw new Error("Failed to create comment");

      return rows[0];
    } catch (err) {
      console.error("Error creating comment:", err);
      throw new Error(err.message);
    }
  }

  // Get all comments for a question or answer
  async getComments(data) {
    try {
      console.log("Getting comments...");
      const hasQuestion = !!data.question_id;
      const hasAnswer = !!data.answer_id;
      if (hasQuestion === hasAnswer) {
        throw new Error("Must provide exactly one of question_id or answer_id");
      }

      const [rows] = await pool.execute(
        `SELECT c.comment_id, c.body, c.created_at,
                        u.user_id, u.first_name, u.last_name
                 FROM Comment c
                 JOIN User u ON c.user_id = u.user_id
                 WHERE c.question_id = ? OR c.answer_id = ?
                 ORDER BY c.created_at ASC`,
        [data.question_id || null, data.answer_id || null],
      );

      return rows;
    } catch (err) {
      console.error("Error getting comments:", err);
      throw new Error(err.message);
    }
  }

  // Update comment (if owned)
  async updateComment(data) {
    try {
      console.log("Updating comment...");

      const [existing] = await pool.execute(
        `SELECT user_id FROM Comment WHERE comment_id = ?`,
        [data.comment_id],
      );

      if (existing.length === 0) throw new Error("Comment not found");
      if (existing[0].user_id !== data.user_id) {
        throw new Error("Not authorized to edit this comment");
      }

      await pool.execute(
        `UPDATE Comment
                 SET body = ?
                 WHERE comment_id = ?`,
        [data.body, data.comment_id],
      );

      const [rows] = await pool.execute(
        `SELECT c.comment_id, c.body, c.created_at,
                        u.user_id, u.first_name, u.last_name
                 FROM Comment c
                 JOIN User u ON c.user_id = u.user_id
                 WHERE c.comment_id = ?`,
        [data.comment_id],
      );

      return rows[0];
    } catch (err) {
      console.error("Error updating comment:", err);
      throw new Error(err.message);
    }
  }

  // Delete comment
  async deleteComment(data) {
    try {
      console.log("Deleting comment...");

      const [result] = await pool.execute(
        `DELETE FROM Comment WHERE comment_id = ? AND user_id = ?`,
        [data.comment_id, data.user_id],
      );

      if (result.affectedRows === 0) {
        return {
          success: false,
          message: "Comment not found or not authorized to delete",
        };
      }

      return { success: true, message: "Successfully deleted comment" };
    } catch (err) {
      console.error("Error deleting comment:", err);
      throw new Error(err.message);
    }
  }

  async generateAIComment(data) {
    try {
      console.log(`AI generating comment...`);

      // Generate a comment
      const response = await genericHelper.getAIResponse(data);

      // Insert the comment to the table
      data.body = response.text;
      data["user_id"] = 1; // Should be replaced with AI user id.

      return await this.createComment(data);
    } catch (err) {
      console.error("Error generating AI comment:", err);
      throw new Error(err.message);
    }
  }
}

module.exports = new CommentService();
