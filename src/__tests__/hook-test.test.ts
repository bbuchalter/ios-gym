// Temporary test file to verify pre-commit hook blocks failing tests

describe("Hook Test", () => {
  test("should fail to test pre-commit hook", () => {
    expect(true).toBe(false); // This will fail
  });
});

