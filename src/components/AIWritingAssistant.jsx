import React, { useState, useEffect } from "react";
import { EditorState, Modifier, SelectionState } from "draft-js";

const AIWritingAssistant = ({ editorState, setEditorState }) => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  // Get the authentication token when component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    setAuthToken(token);
  }, []);

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

    if (!authToken) {
      setError("You must be logged in to use the AI Writing Assistant");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log(
        "Sending request with token:",
        authToken.substring(0, 10) + "..."
      );

      const response = await fetch("http://localhost:5005/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": authToken,
          // Also include as Authorization header for compatibility
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ prompt }),
      });

      console.log("Response status:", response.status);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || `Server error: ${response.status}`
        );
      }

      insertTextIntoEditor(data.content);
      setPrompt("");
      setIsOpen(false);
    } catch (err) {
      console.error("Error:", err);
      setError(`Failed to generate content: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testApiConnection = async () => {
    if (!authToken) {
      setError("You must be logged in to test the connection");
      return;
    }

    try {
      const response = await fetch("http://localhost:5005/api/ai/test-openai", {
        headers: {
          "x-auth-token": authToken,
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      console.log("Test API Result:", data);

      if (response.ok) {
        setError("✅ Connection successful!");
      } else {
        setError(`❌ Test failed: ${data.error || data.message}`);
      }
    } catch (err) {
      console.error("Test API Error:", err);
      setError(`❌ Connection test failed: ${err.message}`);
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
          <button
            onClick={testApiConnection}
            className="generateContentButton"
            style={{ marginBottom: "10px", backgroundColor: "#4a5568" }}
          >
            Test Connection
          </button>

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
