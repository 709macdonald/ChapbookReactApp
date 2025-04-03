import React, { useState } from "react";
import { EditorState, Modifier, SelectionState } from "draft-js";
import OpenAI from "openai";

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

    const currentBlock = currentContent.getBlockForKey(selection.getStartKey());

    const blockLength = currentBlock.getLength();
    let targetSelection;

    if (blockLength > 0) {
      targetSelection = SelectionState.createEmpty(currentBlock.getKey()).merge(
        {
          anchorOffset: blockLength,
          focusOffset: blockLength,
        }
      );
    } else {
      targetSelection = SelectionState.createEmpty(currentBlock.getKey()).merge(
        {
          anchorOffset: 0,
          focusOffset: 0,
        }
      );
    }

    let newEditorState = EditorState.forceSelection(
      editorState,
      targetSelection
    );

    const newContent = Modifier.insertText(
      newEditorState.getCurrentContent(),
      targetSelection,
      text
    );

    newEditorState = EditorState.push(
      newEditorState,
      newContent,
      "insert-characters"
    );

    const newSelection = newContent.getSelectionAfter();
    newEditorState = EditorState.forceSelection(newEditorState, newSelection);

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
        <button
          className="editStyleButton AIButton"
          onClick={() => setIsOpen(!isOpen)}
        >
          <i className="fas fa-robot"></i>
        </button>
      </div>

      {isOpen && (
        <div className="aiToolsDiv">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt (e.g., 'Write a short story about...')"
            className="aiPromptWritingBox"
          />

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            onClick={handleGenerateContent}
            disabled={isLoading}
            className="generateContentButton"
          >
            {isLoading ? "Generating..." : "Generate Content"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AIWritingAssistant;
