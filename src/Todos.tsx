import { useForm, useStore } from "@tanstack/react-form";
import { z } from "zod";
import { db } from "@/store";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Todo from "@/Todo";

import useUserId from "@/hooks/useUser";
import {
  buildFieldErrorId,
  FieldInfo,
  isFieldInvalid,
} from "./components/ui/field";

const todoSchema = z.object({
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
});

type Todo = {
  id: string;
  completed: boolean;
} & z.infer<typeof todoSchema>;

function Todos() {
  const [todos, setTodos] = useState<Todo[]>();
  const userId = useUserId();

  function onAddTodo(value: z.infer<typeof todoSchema>) {
    if (!userId) {
      return;
    }

    addDoc(collection(db, "users", userId, "todos"), {
      title: value.title,
      completed: false,
      priority: value.priority,
    });
  }

  function onRemoveTodo(todoId: string) {
    if (!userId) {
      return;
    }

    deleteDoc(doc(db, "users", userId, "todos", todoId));
  }

  function onCompleteTodo(todoId: string) {
    if (!userId) {
      return;
    }

    updateDoc(doc(db, "users", userId, "todos", todoId), {
      completed: true,
    });
  }

  useEffect(() => {
    if (!userId) {
      return;
    }

    const _unsubscribe = onSnapshot(
      collection(db, "users", userId, "todos"),
      (collection) => {
        // NOTE: types are wrong here
        const todos = collection.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Todo[];
        setTodos(todos);
      },
    );
  }, [userId]);

  const form = useForm({
    defaultValues: {
      title: "",
      priority: "medium",
    },
    validators: {
      onSubmit: todoSchema,
    },
    onSubmit: ({ value }) => {
      // @ts-expect-error unsure why priortity is widened to a string, might be a bug in tanstack/form
      onAddTodo(value);
    },
  });
  if (!userId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircleIcon className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  const completedTodos = todos?.filter((todo) => todo.completed);

  const formErrors = useStore(form.store, (formState) => formState.errors);
  console.log("🚀 ~ Todos ~ formErrors:", formErrors);

  return (
    <Card className="w-full md:w-[60%] mx-auto">
      <CardHeader>
        <CardTitle>Todo List</CardTitle>
        <CardDescription>Add new items using form below.</CardDescription>
      </CardHeader>
      <CardContent></CardContent>
      <CardFooter className="flex justify-between flex-col">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value={"all"}>
            <ul>
              {todos?.map((todo) => (
                <Todo
                  key={todo.id}
                  todo={todo}
                  onRemove={onRemoveTodo}
                  onComplete={onCompleteTodo}
                />
              ))}
            </ul>
          </TabsContent>
          <TabsContent value={"completed"}>
            <ul className={"list-none space-y-2"}>
              {completedTodos?.map((todo) => (
                <Todo
                  key={todo.id}
                  todo={todo}
                  onRemove={onRemoveTodo}
                  onComplete={onCompleteTodo}
                />
              ))}
            </ul>
          </TabsContent>
        </Tabs>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="w-full"
        >
          <div className="flex gap-2 w-full mt-4">
            <form.Field name="title">
              {(field) => (
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Add a new task"
                    name={field.name}
                    value={field.state.value}
                    aria-describedby={
                      isFieldInvalid(field)
                        ? buildFieldErrorId(field)
                        : undefined
                    }
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldInfo field={field} />
                </div>
              )}
            </form.Field>
            <form.Field name="priority">
              {(field) => (
                <div className="w-max">
                  <Select
                    name={field.name}
                    value={field.state.value}
                    aria-describedby={
                      isFieldInvalid(field)
                        ? buildFieldErrorId(field)
                        : undefined
                    }
                    onValueChange={(value) =>
                      field.handleChange(
                        value as z.infer<typeof todoSchema>["priority"],
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldInfo field={field} />
                </div>
              )}
            </form.Field>

            <Button type="submit">Add</Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}

export default Todos;
