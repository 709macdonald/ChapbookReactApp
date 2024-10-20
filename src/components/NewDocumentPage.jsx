import React, { useState, useCallback } from "react";
import { Editor, EditorState, RichUtils, Modifier } from "draft-js";
import "draft-js/dist/Draft.css";

const COLORS = [
  { label: "Black", style: "BLACK" },
  { label: "Red", style: "RED" },
  { label: "Green", style: "GREEN" },
  { label: "Blue", style: "BLUE" },
  { label: "Purple", style: "PURPLE" },
  { label: "Orange", style: "ORANGE" },
];

const NewDocumentPage = ({
  newDocumentPage,
  setNewDocumentPage,
  setShowAllFiles,
  setBgLogoOn,
}) => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const [currentColor, setCurrentColor] = useState("BLACK");

  const backToAllFileView = () => {
    setBgLogoOn(true);
    setShowAllFiles(true);
    setNewDocumentPage(false);
  };

  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  const toggleInlineStyle = (inlineStyle, e) => {
    e.preventDefault();
    setEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  const toggleAlignment = (alignment, e) => {
    e.preventDefault();
    const selection = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    const blockKey = selection.getStartKey();
    const blockData = currentContent
      .getBlockForKey(blockKey)
      .getData()
      .merge({ textAlign: alignment });

    const newContentState = Modifier.setBlockData(
      currentContent,
      selection,
      blockData
    );
    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      "change-block-data"
    );

    setEditorState(newEditorState);
  };

  const onUndoClick = (e) => {
    e.preventDefault();
    setEditorState(EditorState.undo(editorState));
  };

  const onRedoClick = (e) => {
    e.preventDefault();
    setEditorState(EditorState.redo(editorState));
  };

  const applyColor = useCallback(
    (color) => {
      const selection = editorState.getSelection();
      const nextContentState = COLORS.reduce((contentState, c) => {
        return Modifier.removeInlineStyle(contentState, selection, c.style);
      }, editorState.getCurrentContent());

      let nextEditorState = EditorState.push(
        editorState,
        Modifier.applyInlineStyle(nextContentState, selection, color),
        "change-inline-style"
      );

      if (selection.isCollapsed()) {
        // If no text is selected, set up the editor to apply the style to the next character
        nextEditorState = EditorState.forceSelection(
          nextEditorState,
          selection
        );
      }

      setEditorState(nextEditorState);
      setCurrentColor(color);
    },
    [editorState]
  );

  const handleBeforeInput = useCallback(
    (chars, editorState) => {
      const currentStyle = editorState.getCurrentInlineStyle();

      // If the current style doesn't include the current color, add it
      if (!currentStyle.has(currentColor)) {
        setEditorState(RichUtils.toggleInlineStyle(editorState, currentColor));
      }
      return "not-handled";
    },
    [currentColor]
  );

  const onChange = useCallback(
    (newEditorState) => {
      const selection = newEditorState.getSelection();
      if (selection.isCollapsed()) {
        const currentStyle = newEditorState.getCurrentInlineStyle();
        if (!currentStyle.has(currentColor)) {
          newEditorState = RichUtils.toggleInlineStyle(
            newEditorState,
            currentColor
          );
        }
      }
      setEditorState(newEditorState);
    },
    [currentColor]
  );

  const styleMap = {
    BLACK: { color: "black" },
    RED: { color: "red" },
    GREEN: { color: "green" },
    BLUE: { color: "blue" },
    PURPLE: { color: "purple" },
    ORANGE: { color: "orange" },
  };

  const blockStyleFn = (contentBlock) => {
    const textAlign = contentBlock.getData().get("textAlign");
    return textAlign ? `align-${textAlign}` : "";
  };

  if (!newDocumentPage) return null;

  return (
    <div className="p-4">
      <button
        onClick={backToAllFileView}
        className="mb-4 px-4 py-2 bg-gray-200 rounded"
      >
        Back
      </button>
      <h1 className="text-2xl font-bold mb-4">New Document</h1>
      <div className="mb-2 space-x-2">
        <button
          onMouseDown={(e) => toggleInlineStyle("BOLD", e)}
          className={`p-2 border rounded ${
            editorState.getCurrentInlineStyle().has("BOLD") ? "bg-gray-300" : ""
          }`}
        >
          <i className="fas fa-bold"></i>
        </button>
        <button
          onMouseDown={(e) => toggleInlineStyle("ITALIC", e)}
          className={`p-2 border rounded ${
            editorState.getCurrentInlineStyle().has("ITALIC")
              ? "bg-gray-300"
              : ""
          }`}
        >
          <i className="fas fa-italic"></i>
        </button>
        <button
          onMouseDown={(e) => toggleInlineStyle("UNDERLINE", e)}
          className={`p-2 border rounded ${
            editorState.getCurrentInlineStyle().has("UNDERLINE")
              ? "bg-gray-300"
              : ""
          }`}
        >
          <i className="fas fa-underline"></i>
        </button>
        <button
          onMouseDown={(e) => toggleAlignment("left", e)}
          className="p-2 border rounded"
        >
          <i className="fas fa-align-left"></i>
        </button>
        <button
          onMouseDown={(e) => toggleAlignment("center", e)}
          className="p-2 border rounded"
        >
          <i className="fas fa-align-center"></i>
        </button>
        <button
          onMouseDown={(e) => toggleAlignment("right", e)}
          className="p-2 border rounded"
        >
          <i className="fas fa-align-right"></i>
        </button>
        <button onMouseDown={onUndoClick} className="p-2 border rounded">
          <i className="fas fa-undo"></i>
        </button>
        <button onMouseDown={onRedoClick} className="p-2 border rounded">
          <i className="fas fa-redo"></i>
        </button>

        {COLORS.map((color) => (
          <button
            key={color.style}
            onMouseDown={(e) => {
              e.preventDefault();
              applyColor(color.style);
            }}
            className={`p-2 border rounded ${
              currentColor === color.style ? "ring-2 ring-offset-2" : ""
            }`}
            style={{
              backgroundColor: color.style.toLowerCase(),
              width: "30px",
              height: "30px",
            }}
            title={color.label}
          />
        ))}
      </div>
      <div className="border border-gray-300 min-h-[300px] p-4 rounded editor-wrapper">
        <Editor
          editorState={editorState}
          onChange={onChange}
          handleKeyCommand={handleKeyCommand}
          handleBeforeInput={handleBeforeInput}
          customStyleMap={styleMap}
          blockStyleFn={blockStyleFn}
        />
      </div>
    </div>
  );
};

export default NewDocumentPage;
