import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";
import { z } from "zod";

export const todoSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  priority: z.enum(["high", "medium", "low"], {
    errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_enum_value) {
        return {
          message: "Priority must be one of: high, medium, low",
        };
      }

      return {
        message: ctx.defaultError,
      };
    },
  }),
  completed: z.boolean().optional(),
});

export type TodoEntity = {
  id: string;
} & z.infer<typeof todoSchema>;

type TodoProps = {
  todo: TodoEntity;
  onRemove: (id: string) => void;
  onComplete: (id: string) => void;
};

function Todo({ todo, onRemove, onComplete }: TodoProps) {
  return (
    <li
      className={`flex items-center justify-between rounded-md px-4 py-2 gap-2`}
    >
      <Checkbox
        id={`task-${todo.id}`}
        checked={todo.completed}
        onCheckedChange={() => onComplete(todo.id)}
      />
      <label
        htmlFor={`task-${todo.id}`}
        className={`text-base flex-1 font-medium ${
          todo.completed
            ? "line-through text-gray-500 dark:text-gray-400"
            : "text-gray-900 dark:text-gray-50"
        }`}
      >
        {todo.title}
      </label>
      <div
        className={`rounded-md px-2 py-1 text-xs font-medium invisible md:visible ${
          todo.priority === "high"
            ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
            : todo.priority === "medium"
              ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400"
              : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
        }`}
      >
        {todo.priority}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(todo.id)}
        aria-label={`Remove ${todo.title}`}
      >
        <Trash2Icon className="w-4 h-4" />
      </Button>
    </li>
  );
}

export default Todo;
