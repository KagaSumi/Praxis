
const CourseService = require("../services/course-services");
const { pool } = require("../services/database");

jest.mock("../services/database", () => ({
    pool: {
        execute: jest.fn()
    }
}));

describe("CourseService", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    // ---- createCourse ----
    test("createCourse - creates a new course", async () => {
        pool.execute
            .mockResolvedValueOnce([[], []]) // no existing course
            .mockResolvedValueOnce([{ insertId: 10 }, []]) // insert result
            .mockResolvedValueOnce([[{ course_id: 10, name: "A", code: "A101" }], []]); // return new course

        const result = await CourseService.createCourse({ name: "A", code: "A101" });

        expect(result).toEqual({ course_id: 10, name: "A", code: "A101" });
        expect(pool.execute).toHaveBeenCalledTimes(3);
    });

    test("createCourse - throws if course already exists", async () => {
        pool.execute.mockResolvedValueOnce([[{ course_id: 1 }], []]);

        await expect(
            CourseService.createCourse({ name: "A", code: "A101" })
        ).rejects.toThrow("Course with this name already exists");
    });

    // ---- getAllCourses ----
    test("getAllCourses - returns list of courses", async () => {
        pool.execute.mockResolvedValueOnce([[{ id: 1 }, { id: 2 }], []]);

        const result = await CourseService.getAllCourses();

        expect(result.length).toBe(2);
        expect(pool.execute).toHaveBeenCalledTimes(1);
    });

    // ---- getCourseById ----
    test("getCourseById - returns a course", async () => {
        pool.execute.mockResolvedValueOnce([[{ course_id: 5, name: "Test" }], []]);

        const result = await CourseService.getCourseById(5);

        expect(result).toEqual({ course_id: 5, name: "Test" });
    });

    test("getCourseById - throws if not found", async () => {
        pool.execute.mockResolvedValueOnce([[], []]);

        await expect(CourseService.getCourseById(5)).rejects.toThrow("Course not found");
    });

    // ---- deleteCourse ----
    test("deleteCourse - deletes a course successfully", async () => {
        pool.execute
            .mockResolvedValueOnce([[{ course_id: 5 }], []]) // existing course
            .mockResolvedValueOnce([{}, []]); // delete result

        const result = await CourseService.deleteCourse(5);

        expect(result).toEqual({ message: "Course deleted successfully" });
        expect(pool.execute).toHaveBeenCalledTimes(2);
    });

    test("deleteCourse - throws if not found", async () => {
        pool.execute.mockResolvedValueOnce([[], []]);

        await expect(CourseService.deleteCourse(99)).rejects.toThrow("Course not found");
    });
});
