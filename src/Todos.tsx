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

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
};

function Todos() {
  const [todos, setTodos] = useState<Todo[]>();
  const userId = useUserId();
  const [newTask, setNewTask] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");

  function onAddTodo() {
    if (!userId) {
      return;
    }

    addDoc(collection(db, "users", userId, "todos"), {
      title: newTask,
      completed: false,
      priority: newTaskPriority,
    });

    setNewTask("");
    setNewTaskPriority("medium");
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

  const completedTodos = todos?.filter((todo) => todo.completed);

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

        <div className="flex gap-2 w-full mt-4">
          <Input
            type="text"
            placeholder="Add a new task"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="flex-1"
          />
          <div>
            <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={onAddTodo}>Add</Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default Todos;
