import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { db } from "@/store";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
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
import Todo, { todoSchema, type TodoEntity } from "@/Todo";

import useUserId from "@/hooks/useUser";
import {
  buildFieldErrorId,
  FieldInfo,
  isFieldInvalid,
} from "./components/ui/field";
import { LoaderCircleIcon } from "lucide-react";
import { cn } from "./lib/utils";

const formSchema = todoSchema.pick({ priority: true, title: true });
const todosFromStoreSchema = z.array(todoSchema);

function Todos() {
  const [todos, setTodos] = useState<TodoEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const userId = useUserId();

  useEffect(() => {
    setIsLoading(true);

    if (!userId) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      // Maybe order by priority and limit for pagination
      collection(db, "users", userId, "todos"),
      (collection) => {
        const todosFromStore = collection.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const todosData = todosFromStoreSchema.safeParse(todosFromStore);

        if (!todosData.success) {
          console.error("Invalid todo data", todosData.error);
          throw new Error("Invalid todo data");
        }

        setTodos(todosData.data);
        setIsLoading(false);
      },
      (error) => {
        console.error(error);
        throw new Error(error.message);
      },
    );

    return unsubscribe;
  }, [userId]);

  const form = useForm({
    defaultValues: {
      title: "",
      priority: "medium",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      // @ts-expect-error unsure why priortity is widened to a string, might be a bug in tanstack/form
      await onAddTodo(value);
    },
  });

  if (!userId || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircleIcon className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  async function onAddTodo(value: z.infer<typeof todoSchema>) {
    if (!userId) {
      return;
    }

    await addDoc(collection(db, "users", userId, "todos"), {
      title: value.title,
      completed: false,
      priority: value.priority,
    });

    form.reset(undefined, {
      keepDefaultValues: true,
    });
  }

  async function onRemoveTodo(todoId: string) {
    if (!userId || !todoId) return;

    await deleteDoc(doc(db, "users", userId, "todos", todoId));
  }

  async function onCompleteTodo(todoId: string) {
    if (!userId || !todoId) {
      return;
    }

    const todo = todos.find((t) => t.id === todoId);
    if (!todo) return;

    await updateDoc(doc(db, "users", userId, "todos", todoId), {
      completed: !todo.completed,
    });
  }

  const completedTodos = todos.filter((todo) => todo.completed);

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
              {todos.map((todo) => (
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
              {completedTodos.map((todo) => (
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
          <div className="flex flex-col md:flex-row gap-2 w-full mt-4">
            <form.Field name="title">
              {(field) => (
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Add a new task"
                    aria-label="Add a new task"
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
                <div className="w-full md:w-max">
                  <Select
                    name={field.name}
                    value={field.state.value}
                    aria-label="Priority"
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
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "grid grid-rows-1 grid-cols-2 place-items-center",
                  )}
                >
                  <span
                    aria-hidden={!isSubmitting}
                    className="col-span-full row-span-full"
                  >
                    <span className="sr-only">Saving...</span>
                    <LoaderCircleIcon
                      className={cn(
                        "w-4 h-4 animate-spin",
                        isSubmitting ? "visible" : "invisible",
                      )}
                    />
                  </span>

                  <span
                    className={cn(
                      "col-span-full row-span-full",
                      isSubmitting ? "invisible" : "visible",
                    )}
                    aria-hidden={isSubmitting}
                  >
                    Add
                  </span>
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}

export default Todos;
