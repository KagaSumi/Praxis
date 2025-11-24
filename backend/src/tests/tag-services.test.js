const TagService = require("../services/tag-services");
const { pool } = require("../services/database");

jest.mock("../services/database", () => ({
  pool: {
    execute: jest.fn(),
  },
}));

describe("TagService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("isTag", () => {
    test("should return tag_id if tag exists", async () => {
      pool.execute.mockResolvedValueOnce([[{ tag_id: 1 }], []]);
      const tagId = await TagService.isTag("js");
      expect(tagId).toBe(1);
      expect(pool.execute).toHaveBeenCalledWith(
        "SELECT tag_id FROM Tag WHERE name = ?",
        ["js"]
      );
    });

    test("should return null if tag does not exist", async () => {
      pool.execute.mockResolvedValueOnce([[], []]);
      const tagId = await TagService.isTag("unknown");
      expect(tagId).toBeNull();
    });
  });

  describe("createTag", () => {
    test("should return existing tag_id if tag exists", async () => {
      jest.spyOn(TagService, "isTag").mockResolvedValueOnce(5);
      const tagId = await TagService.createTag("existing");
      expect(tagId).toBe(5);
      expect(TagService.isTag).toHaveBeenCalledWith("existing");
    });

    test("should insert a new tag if it does not exist", async () => {
      jest.spyOn(TagService, "isTag").mockResolvedValueOnce(null);
      pool.execute.mockResolvedValueOnce([{ insertId: 10 }]);
      const tagId = await TagService.createTag("newtag");
      expect(tagId).toBe(10);
      expect(pool.execute).toHaveBeenCalledWith(
        "INSERT INTO Tag (name) VALUES (?)",
        ["newtag"]
      );
    });
  });

  describe("getAllTags", () => {
    test("should return all tags", async () => {
      const mockTags = [{ tag_id: 1, name: "js" }, { tag_id: 2, name: "node" }];
      pool.execute.mockResolvedValueOnce([mockTags, []]);
      const tags = await TagService.getAllTags();
      expect(tags).toEqual(mockTags);
      expect(pool.execute).toHaveBeenCalledWith(
        "SELECT * FROM Tag ORDER BY tag_id ASC"
      );
    });
  });

  describe("getTagById", () => {
    test("should return tag if it exists", async () => {
      const mockTag = { tag_id: 1, name: "js" };
      pool.execute.mockResolvedValueOnce([[mockTag], []]);
      const tag = await TagService.getTagById(1);
      expect(tag).toEqual(mockTag);
    });

    test("should return null if tag does not exist", async () => {
      pool.execute.mockResolvedValueOnce([[], []]);
      const tag = await TagService.getTagById(99);
      expect(tag).toBeNull();
    });
  });

  describe("updateTag", () => {
    test("should return true if update affected rows", async () => {
      pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
      const result = await TagService.updateTag(1, "newName");
      expect(result).toBe(true);
      expect(pool.execute).toHaveBeenCalledWith(
        "UPDATE Tag SET name = ? WHERE tag_id = ?",
        ["newName", 1]
      );
    });

    test("should return false if no rows updated", async () => {
      pool.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);
      const result = await TagService.updateTag(1, "newName");
      expect(result).toBe(false);
    });
  });

  describe("deleteTag", () => {
    test("should return true if delete affected rows", async () => {
      pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
      const result = await TagService.deleteTag(1);
      expect(result).toBe(true);
      expect(pool.execute).toHaveBeenCalledWith(
        "DELETE FROM Tag WHERE tag_id = ?",
        [1]
      );
    });

    test("should return false if no rows deleted", async () => {
      pool.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);
      const result = await TagService.deleteTag(99);
      expect(result).toBe(false);
    });
  });
});
