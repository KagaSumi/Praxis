const tagService = require("../services/tag-services");
const ErrorCodes = require("../enums/error-code-enum");

class TagController {
  createTag(req, res) {
    tagService
      .createTag(req.body.name)
      .then((tagId) => {
        res.json({ tag_id: tagId, name: req.body.name });
      })
      .catch((err) => {
        console.error("Error creating tag:", err);
        res.status(ErrorCodes.INVALID_REQUEST).send(err.message);
      });
  }

  getAllTags(req, res) {
    tagService
      .getAllTags()
      .then((tags) => {
        console.log(tags);
        res.json(tags);
      })
      .catch((err) => {
        console.error("Error fetching tags:", err);
        res.status(ErrorCodes.INVALID_REQUEST).send(err.message);
      });
  }

  async getTagById(req, res) {
    try {
      const tagId = req.params.id;
      const tag = await tagService.getTagById(tagId);
      if (!tag) {
        return res.status(404).json({ error: "Tag not found" });
      }
      res.json(tag);
    } catch (err) {
      console.error("Error fetching tag:", err);
      res.status(500).json({ error: err.message });
    }
  }

  async updateTag(req, res) {
    try {
      const tagId = req.params.id;
      const newName = req.body.name;
      const success = await tagService.updateTag(tagId, newName);

      if (!success) {
        return res.status(404).json({ error: "Tag not found" });
      }

      res.json({ message: "Tag updated successfully" });
    } catch (err) {
      console.error("Error updating tag:", err);
      res.status(500).json({ error: err.message });
    }
  }

  async deleteTag(req, res) {
    try {
      const tagId = req.params.id;
      const success = await tagService.deleteTag(tagId);

      if (!success) {
        return res.status(404).json({ error: "Tag not found" });
      }

      res.json({ message: "Tag deleted successfully" });
    } catch (err) {
      console.error("Error deleting tag:", err);
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new TagController();
