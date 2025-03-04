import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:5174");
});

test("complete task workflow", async ({ page }) => {
  // Create a new task
  const taskTitle = "Buy apples";
  const input = page.getByRole("textbox", { name: "Add a new task" });
  await input.fill(taskTitle);

  // TODO fix why the select doesn't open
  // Change priority (assuming a dropdown or select element)
  const prioritySelect = page.getByRole("combobox");
  await prioritySelect.click();
  await page.getByRole("option", { name: "High" }).click();

  // Add the task
  await page.getByRole("button", { name: "Add" }).click();

  // Verify task was added
  const taskElement = page.getByRole("checkbox", { name: taskTitle });
  await expect(taskElement).toBeVisible();

  // Add another task
  const taskTitle2 = "Buy oranges";
  const input2 = page.getByRole("textbox", { name: "Add a new task" });
  await expect(input2).toHaveValue("");
  await input2.fill(taskTitle2);
  await page.getByRole("button", { name: "Add" }).click();
  const taskElement2 = page.getByRole("checkbox", { name: taskTitle2 });
  await expect(taskElement2).toBeVisible();

  // Complete the task
  await taskElement.check();

  // Move to completed tasks tab
  await page.getByRole("tab", { name: "Completed" }).click();

  // Verify task is in completed list
  await expect(taskElement).toBeVisible();
  await expect(
    page.getByRole("checkbox", { name: taskTitle2 }),
  ).not.toBeVisible();

  // Uncomplete the task
  // .uncheck() not working, using click instead
  await page.getByRole("checkbox", { name: taskTitle }).click();

  // Move back to all tasks tab
  await page.getByRole("tab", { name: "All" }).click();

  // Verify task is visible in all tasks
  await expect(taskElement).toBeVisible();
  await expect(taskElement2).toBeVisible();
  // Delete the task
  await page.getByRole("button", { name: `Remove ${taskTitle}` }).click();

  // Verify task was deleted
  await expect(taskElement).not.toBeVisible();
  await expect(taskElement2).toBeVisible();
});
