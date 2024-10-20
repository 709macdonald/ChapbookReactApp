import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  Modifier,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const COLORS = [
  { label: "Black", style: "BLACK", hex: "#000000" },
  { label: "Red", style: "RED", hex: "#FF0000" },
  { label: "Green", style: "GREEN", hex: "#008000" },
  { label: "Blue", style: "BLUE", hex: "#0000FF" },
  { label: "Purple", style: "PURPLE", hex: "#800080" },
  { label: "Orange", style: "ORANGE", hex: "#FFA500" },
];

const STORAGE_KEY = "myEditorContent";

const NewDocumentPage = ({
  newDocumentPage,
  setNewDocumentPage,
  setShowAllFiles,
  setBgLogoOn,
}) => {
  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem(STORAGE_KEY);
    if (savedContent) {
      return EditorState.createWithContent(
        convertFromRaw(JSON.parse(savedContent))
      );
    }
    return EditorState.createEmpty();
  });

  const [currentColor, setCurrentColor] = useState("BLACK");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    const content = editorState.getCurrentContent();
    const rawContent = convertToRaw(content);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rawContent));
  }, [editorState]);

  const backToAllFileView = () => {
    setBgLogoOn(true);
    setShowAllFiles(true);
    setNewDocumentPage(false);
  };

  const saveAsPDF = async () => {
    if (editorRef.current) {
      const canvas = await html2canvas(editorRef.current);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("document.pdf");
    }
  };

  const deleteDocument = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this document? This action cannot be undone."
      )
    ) {
      localStorage.removeItem(STORAGE_KEY);
      setEditorState(EditorState.createEmpty());
    }
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

  const toggleColorPicker = (e) => {
    e.preventDefault();
    setShowColorPicker(!showColorPicker);
  };

  const selectColor = (color) => {
    applyColor(color.style);
    setShowColorPicker(false);
  };

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
      <div className="flex space-x-2 mb-4">
        <button
          onClick={backToAllFileView}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Back
        </button>
        <button
          onClick={saveAsPDF}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Save as PDF
        </button>
        <button
          onClick={deleteDocument}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Delete Document
        </button>
      </div>
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

        <div className="relative inline-block">
          <button
            onMouseDown={toggleColorPicker}
            className="p-2 border rounded"
            style={{ color: COLORS.find((c) => c.style === currentColor).hex }}
          >
            <i className="fas fa-palette"></i>
          </button>
          {showColorPicker && (
            <div className="absolute mt-1 bg-white border rounded shadow-lg">
              {COLORS.map((color) => (
                <button
                  key={color.style}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectColor(color);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  style={{ color: color.hex }}
                >
                  {color.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div
        ref={editorRef}
        className="border border-gray-300 min-h-[300px] p-4 rounded editor-wrapper"
      >
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
