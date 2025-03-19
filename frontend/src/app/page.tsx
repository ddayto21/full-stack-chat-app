"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

/**
 * ChatPage renders a full-screen chat interface that allows users to send messages
 * to the assistant and view the conversation history.
 *
 * It manages its own state for chat messages, user input, loading status, and errors.
 * When the user submits a message, it sends a POST request to the backend API,
 * receives the assistant's reply, and updates the conversation accordingly.
 *
 * @returns {JSX.Element} The rendered chat interface.
 */
export default function ChatPage() {
  // State to hold the conversation messages.
  const [messages, setMessages] = useState<
    { id: string; role: "user" | "assistant"; content: string }[]
  >([]);

  // State to hold the current value of the input field.
  const [input, setInput] = useState<string>("");

  // State to indicate whether a message is currently being processed.
  const [loading, setLoading] = useState<boolean>(false);

  // State to capture any error messages during the fetch process.
  const [error, setError] = useState<string>("");

  /**
   * Sends the current user message to the backend API and updates the chat state with the assistant's response.
   *
   * This function:
   * - Validates the input.
   * - Creates a user message and immediately adds it to the conversation.
   * - Sends a POST request to the backend endpoint with the user's message.
   * - Processes the backend's JSON response and appends the assistant's reply to the conversation.
   * - Handles errors and updates the loading state.
   *
   * @async
   * @returns {Promise<void>}
   */
  const sendMessage = async () => {
    // Do not send if input is empty.
    if (!input.trim()) return;

    // Create a message object for the user's input.
    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: input,
    };
    // Immediately update the state with the user's message
    setMessages((prev) => [...prev, userMessage]);

    // Clear the input field.
    setInput("");

    // Set loading to true while the request is in progress.
    setLoading(true);

    // Reset any previous error.
    setError("");

    try {
      // Prepare the request payload as expected by the backend.

      const payload = { messages: [userMessage] };

      // Send POST request to the backend application.
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Parse the JSON response.
      const data = await response.json();

      // The backend should return { response: "assistant reply" }.
      const assistantMessage = {
        id: Date.now().toString(),
        role: "assistant" as const,
        content: data.response,
      };

      // Append the assistant's response to the chat messages.
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      console.error("Error sending message:", err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles the form submission event.
   * Prevents the default form submission behavior and calls sendMessage.
   *
   * @param {FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await sendMessage();
  };

  /**
   * Handles changes in the input field by updating the input state.
   *
   * @param {ChangeEvent<HTMLInputElement>} e - The change event from the input field.
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl shadow-md">
        <CardContent className="p-4 bg-white">
          {/* Chat History Section */}
          <div className="flex flex-col space-y-4 h-96 overflow-y-auto">
            {messages.length === 0 && (
              <div className="text-center text-gray-500">
                Start chatting with the assistant!
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <Card className="max-w-xs">
                  <CardContent
                    className={`px-4 py-2 rounded-lg break-words ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    {message.content}
                  </CardContent>
                </Card>
              </div>
            ))}

            {/* Display a loading message while waiting for the assistant's reply */}
            {loading && (
              <div className="text-center text-gray-500">Loading...</div>
            )}

            {/* Display error messages if any */}
            {error && <div className="text-center text-red-500">{error}</div>}
          </div>

          {/* Input Section for sending messages */}
          <form onSubmit={handleSubmit} className="mt-4 flex">
            <Input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={handleInputChange}
              disabled={loading}
              className="flex-grow rounded-l-lg border-r-0"
            />
            <Button type="submit" disabled={loading} className="rounded-r-lg">
              Send
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
