import React, { useState, useEffect } from "react";
import { RichUtils, Modifier, EditorState } from "draft-js";
import { convertToRaw } from "draft-js";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { v4 as uuidv4 } from "uuid";
import AIWritingAssistant from "./AIWritingAssistant";
import { getBaseUrlWithEnv } from "../assets/utils/backendConnect";
import toast from "react-hot-toast";

const COLORS = [
  { label: "Black", style: "BLACK", hex: "#000000" },
  { label: "Red", style: "RED", hex: "#FF0000" },
  { label: "Green", style: "GREEN", hex: "#008000" },
  { label: "Blue", style: "BLUE", hex: "#0000FF" },
  { label: "Purple", style: "PURPLE", hex: "#800080" },
  { label: "Orange", style: "ORANGE", hex: "#FFA500" },
];

const ALIGNMENTS = {
  LEFT: "left",
  CENTER: "center",
  RIGHT: "right",
};

const TextEditorButtons = ({
  setIsLoadingFiles,
  editorState,
  setEditorState,
  editorRef,
  documentTitle,
  backToAllFileView,
  setFiles,
  selectedUserCreatedFile,
  files,
  documentTags,
}) => {
  const [currentColor, setCurrentColor] = useState("BLACK");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const getCurrentAlignment = (editorState) => {
    const selection = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    const currentBlock = currentContent.getBlockForKey(selection.getStartKey());
    return currentBlock.getData().get("alignment") || ALIGNMENTS.LEFT;
  };

  const toggleInlineStyle = (inlineStyle, e) => {
    e.preventDefault();
    setEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  const toggleAlignment = (alignment, e) => {
    e.preventDefault();

    const selection = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    const startKey = selection.getStartKey();
    const endKey = selection.getEndKey();
    const blockMap = currentContent.getBlockMap();

    let newContentState = currentContent;

    if (selection.isCollapsed()) {
      const currentBlock = currentContent.getBlockForKey(startKey);
      const blockData = currentBlock.getData().merge({ alignment });
      newContentState = Modifier.setBlockData(
        currentContent,
        selection.merge({
          anchorKey: startKey,
          focusKey: startKey,
          anchorOffset: 0,
          focusOffset: currentBlock.getLength(),
        }),
        blockData
      );
    } else {
      blockMap
        .skipUntil((_, k) => k === startKey)
        .takeUntil((_, k) => k === endKey)
        .concat([[endKey, blockMap.get(endKey)]])
        .forEach((block, blockKey) => {
          const blockData = block.getData().merge({ alignment });
          newContentState = Modifier.setBlockData(
            newContentState,
            selection.merge({
              anchorKey: blockKey,
              focusKey: blockKey,
              anchorOffset: 0,
              focusOffset: block.getLength(),
            }),
            blockData
          );
        });
    }

    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      "change-block-data"
    );

    setEditorState(EditorState.forceSelection(newEditorState, selection));
  };

  const toggleColorPicker = (e) => {
    e.preventDefault();
    setShowColorPicker(!showColorPicker);
  };

  const selectColor = (color) => {
    applyColor(color.style);
    setShowColorPicker(false);
  };

  const applyColor = (color) => {
    const selection = editorState.getSelection();
    const nextContentState = COLORS.reduce((contentState, c) => {
      return Modifier.removeInlineStyle(contentState, selection, c.style);
    }, editorState.getCurrentContent());

    let nextEditorState = EditorState.push(
      editorState,
      nextContentState,
      "change-inline-style"
    );

    nextEditorState = EditorState.push(
      nextEditorState,
      Modifier.applyInlineStyle(nextContentState, selection, color),
      "change-inline-style"
    );

    if (selection.isCollapsed()) {
      nextEditorState = EditorState.forceSelection(nextEditorState, selection);
    }

    setEditorState(nextEditorState);
    setCurrentColor(color);
  };

  const saveToChapbook = async () => {
    const currentContent = editorState.getCurrentContent();
    const rawContent = convertToRaw(currentContent);
    const plainText = currentContent.getPlainText();

    const hasContent = plainText.trim().length > 0;

    if (!hasContent) {
      alert("Cannot save empty document");
      return;
    }

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      alert("Authentication required. Please log in again.");
      return;
    }

    setIsLoadingFiles(true);

    try {
      const currentDate = new Date().toISOString();

      if (
        selectedUserCreatedFile &&
        files.some((file) => file.id === selectedUserCreatedFile.id)
      ) {
        const updatedFile = {
          ...selectedUserCreatedFile,
          name: `${documentTitle}.txt`,
          date: currentDate,
          fileContent: JSON.stringify(rawContent),
          text: plainText,
          tags: documentTags,
          UserId: userId,
        };

        const res = await fetch(
          `${getBaseUrlWithEnv()}/api/files/${selectedUserCreatedFile.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedFile),
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to update file");
        }

        setFiles((prevFiles) => {
          return prevFiles.map((file) =>
            file.id === selectedUserCreatedFile.id ? updatedFile : file
          );
        });

        console.log("Updated existing file:", updatedFile.name);
      } else {
        const newFileId = uuidv4();
        const newChapbookFile = {
          id: newFileId,
          name: `${documentTitle}.txt`,
          fileUrl: "internal",
          serverKey: "user-created",
          type: "application/draft-js",
          date: currentDate,
          fileContent: JSON.stringify(rawContent),
          text: plainText,
          matchedWords: [],
          locations: [],
          tags: documentTags,
          UserId: userId,
        };

        const res = await fetch(`${getBaseUrlWithEnv()}/api/files`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newChapbookFile),
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to create file");
        }

        setFiles((prevFiles) => [...prevFiles, newChapbookFile]);
      }

      backToAllFileView();
      toast.success("Uploaded to Chapbook!");
    } catch (error) {
      console.error("Error saving document:", error);
      alert("Failed to save document. Please try again.");
    } finally {
      setIsLoadingFiles(false);
    }
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
      pdf.save(`${documentTitle}.pdf`);
    }
  };

  const currentAlignment = getCurrentAlignment(editorState);

  return (
    <div className="styleButtonsDiv">
      <AIWritingAssistant
        editorState={editorState}
        setEditorState={setEditorState}
      />
      <div className="tooltip-wrapper">
        <span className="tooltip">Bold</span>
        <button
          onMouseDown={(e) => toggleInlineStyle("BOLD", e)}
          className={`boldButton editStyleButton ${
            editorState?.getCurrentInlineStyle().has("BOLD")
              ? "bg-gray-300"
              : ""
          }`}
        >
          <i className="fas fa-bold"></i>
        </button>
      </div>

      <div className="tooltip-wrapper">
        <span className="tooltip">Italic</span>
        <button
          onMouseDown={(e) => toggleInlineStyle("ITALIC", e)}
          className={`italicButton editStyleButton ${
            editorState?.getCurrentInlineStyle().has("ITALIC")
              ? "bg-gray-300"
              : ""
          }`}
        >
          <i className="fas fa-italic"></i>
        </button>
      </div>

      <div className="tooltip-wrapper">
        <span className="tooltip">Underline</span>
        <button
          onMouseDown={(e) => toggleInlineStyle("UNDERLINE", e)}
          className={`underLineButton editStyleButton ${
            editorState?.getCurrentInlineStyle().has("UNDERLINE")
              ? "bg-gray-300"
              : ""
          }`}
        >
          <i className="fas fa-underline"></i>
        </button>
      </div>

      <div className="tooltip-wrapper">
        <span className="tooltip">Align Left</span>
        <button
          onMouseDown={(e) => toggleAlignment(ALIGNMENTS.LEFT, e)}
          className={`leftAlignButton editStyleButton ${
            currentAlignment === ALIGNMENTS.LEFT ? "bg-gray-300" : ""
          }`}
        >
          <i className="fas fa-align-left"></i>
        </button>
      </div>

      <div className="tooltip-wrapper">
        <span className="tooltip">Center Align</span>
        <button
          onMouseDown={(e) => toggleAlignment(ALIGNMENTS.CENTER, e)}
          className={`centerAlignButton editStyleButton ${
            currentAlignment === ALIGNMENTS.CENTER ? "bg-gray-300" : ""
          }`}
        >
          <i className="fas fa-align-center"></i>
        </button>
      </div>

      <div className="tooltip-wrapper">
        <span className="tooltip">Align Right</span>
        <button
          onMouseDown={(e) => toggleAlignment(ALIGNMENTS.RIGHT, e)}
          className={`rightAlignButton editStyleButton ${
            currentAlignment === ALIGNMENTS.RIGHT ? "bg-gray-300" : ""
          }`}
        >
          <i className="fas fa-align-right"></i>
        </button>
      </div>

      <div className="colorButtonDiv tooltip-wrapper">
        <span className="tooltip">Text Color</span>
        <button
          onMouseDown={toggleColorPicker}
          className="editStyleButton"
          style={{
            color:
              COLORS.find((c) => c.style === currentColor)?.hex || "#000000",
          }}
        >
          <i
            className="fas fa-palette"
            style={{
              color:
                COLORS.find((c) => c.style === currentColor)?.hex || "#000000",
            }}
          />
        </button>
        {showColorPicker && (
          <div className="colorsDiv">
            {COLORS.map((color) => (
              <button
                key={color.style}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  selectColor(color);
                }}
                className="colorButton"
              >
                <i className="fas fa-circle" style={{ color: color.hex }} />
                <span style={{ color: color.hex }}>{color.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="saveAndDeleteButtonsDiv">
        <div className="tooltip-wrapper">
          <span className="tooltip">Save to Chapbook</span>
          <button onClick={saveToChapbook} className="editStyleButton">
            <i className="fa-solid fa-save"></i>
          </button>
        </div>
        <div className="tooltip-wrapper">
          <span className="tooltip">Save as PDF</span>
          <button onClick={saveAsPDF} className="editStyleButton">
            <i className="fa-solid fa-file-arrow-up"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextEditorButtons;
