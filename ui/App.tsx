import React, { useState, useEffect } from "react";
import CommentList from "@/components/CommentList";
import { CommentProps } from "@/components/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import useAuthorStore from "./hooks/authorHook";
import clsx from "clsx";
interface CommentFormData {
  name: string;
  email: string;
  content: string;
}

function App() {
  const [comments, setComments] = useState<CommentProps["comment"][]>([]);

  const { setAuthor, email, name, clear } = useAuthorStore();

  const {
    register,
    handleSubmit,
    resetField,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>({
    defaultValues: { name: name, email: email, content: "" },
  });

  useEffect(() => {
    // Get query parameter from URL
    const queryParams = new URLSearchParams(window.location.search);
    const postId = queryParams.get("postId");

    // Fetch comments from API
    const fetchComments = async () => {
      const response = await fetch(`/api/comments/${postId}`);
      const data = await response.json();
      if (data.success) {
        setComments(data.result.comments);
      }
    };
    fetchComments();
  }, []);

  const onComment = async (formData: CommentFormData) => {
    const queryParams = new URLSearchParams(window.location.search);
    const postId = queryParams.get("postId");

    const newComment = {
      author: {
        name: formData.name,
        email: formData.email,
      },
      comment: {
        content: formData.content,
        postId: postId || "default",
        postType: "post",
      },
    };

    // Assuming you have an API endpoint to submit comments
    const response = await fetch(`/api/comments-and-authors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newComment),
    });

    const data = await response.json();
    if (data.success) {
      setAuthor(data.author);
      setComments([{ ...data.comment, author: data.author }, ...comments]);
      resetField("content");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Comments</h1>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold mb-4">Add a Comment</h2>
        <form className="space-y-4" onSubmit={handleSubmit(onComment)}>
          {email && name && (
            <div>
              Hello, {email}{" "}
              <button
                type="button"
                className="text-indigo-600 hover:underline"
                onClick={() => {
                  clear();
                  reset({ name: "", email: "", content: "" });
                }}
              >
                change
              </button>
            </div>
          )}

          <div className={clsx("space-y-1", { hidden: !!name })}>
            <Input
              {...register("name", {
                required: { value: true, message: "Name is required" },
              })}
              placeholder="Your name"
              className="w-full"
            />
            {errors.name?.message && (
              <p className="text-red-500 text-sm px-1">
                {errors.name?.message}
              </p>
            )}
          </div>
          <div className={clsx("space-y-1", { hidden: !!email })}>
            <Input
              {...register("email", {
                required: { value: true, message: "Email is required" },
                validate: (value) =>
                  z.string().email().safeParse(value).error?.issues[0]?.message,
              })}
              placeholder="Your email"
              className="w-full"
            />
            {errors.email?.message && (
              <p className="text-red-500 text-sm px-1">
                {errors.email?.message}
              </p>
            )}
          </div>
          <div className={clsx("space-y-1")}>
            <Textarea
              {...register("content", {
                required: {
                  value: true,
                  message: "Comment is required",
                },
              })}
              placeholder="Your comment"
            />
            {errors.content?.message && (
              <p className="text-red-500 text-sm px-1">
                {errors.content?.message}
              </p>
            )}
          </div>
          <div>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </div>
      <CommentList comments={comments} />
    </div>
  );
}

export default App;
