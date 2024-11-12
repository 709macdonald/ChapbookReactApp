import React, { useState } from "react";
import { EditorState, Modifier } from "draft-js";
import OpenAI from "openai";

console.log("API Key available:", !!import.meta.env.VITE_OPENAI_API_KEY);

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const AIWritingAssistant = ({ editorState, setEditorState }) => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const insertTextIntoEditor = (text) => {
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();

    const newContent = Modifier.insertText(currentContent, selection, text);

    const newEditorState = EditorState.push(
      editorState,
      newContent,
      "insert-characters"
    );

    setEditorState(newEditorState);
  };

  const handleGenerateContent = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      setError("API key is not configured");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const generatedContent = completion.choices[0].message.content;
      insertTextIntoEditor(generatedContent);
      setPrompt("");
      setIsOpen(false);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to generate content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="tooltip-wrapper">
        <span className="tooltip">AI Writing Assistant</span>
        <button className="editStyleButton" onClick={() => setIsOpen(true)}>
          <i className="fas fa-robot"></i>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">AI Writing Assistant</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt (e.g., 'Write a short story about...')"
              className="w-full h-32 p-2 border rounded mb-4"
            />

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button
              onClick={handleGenerateContent}
              disabled={isLoading}
              className="w-full bg-blue-500 text-white rounded py-2 px-4 hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isLoading ? "Generating..." : "Generate Content"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIWritingAssistant;
