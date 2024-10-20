import React, { useState, useRef } from "react";
import { Editor, EditorState, RichUtils, Modifier } from "draft-js";
import "draft-js/dist/Draft.css";

const NewDocumentPage = ({
  newDocumentPage,
  setNewDocumentPage,
  setShowAllFiles,
  setBgLogoOn,
}) => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const editorRef = useRef(null);

  const backToAllFileView = () => {
    setBgLogoOn(true);
    setShowAllFiles(true);
    setNewDocumentPage(false);
  };

  const handleKeyCommand = (command, editorState) => {
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
    editorRef.current.focus();
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
    editorRef.current.focus();
  };

  const onUndoClick = (e) => {
    e.preventDefault();
    setEditorState(EditorState.undo(editorState));
    editorRef.current.focus();
  };

  const onRedoClick = (e) => {
    e.preventDefault();
    setEditorState(EditorState.redo(editorState));
    editorRef.current.focus();
  };

  const styleMap = {
    STRIKETHROUGH: {
      textDecoration: "line-through",
    },
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
          onMouseDown={(e) => toggleInlineStyle("STRIKETHROUGH", e)}
          className={`p-2 border rounded ${
            editorState.getCurrentInlineStyle().has("STRIKETHROUGH")
              ? "bg-gray-300"
              : ""
          }`}
        >
          <i className="fas fa-strikethrough"></i>
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
      </div>
      <div className="border border-gray-300 min-h-[300px] p-4 rounded editor-wrapper">
        <Editor
          ref={editorRef}
          editorState={editorState}
          onChange={setEditorState}
          handleKeyCommand={handleKeyCommand}
          placeholder="Start typing your document..."
          customStyleMap={styleMap}
          blockStyleFn={blockStyleFn}
        />
      </div>
    </div>
  );
};

export default NewDocumentPage;
