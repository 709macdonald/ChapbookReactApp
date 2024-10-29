import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  Modifier,
  convertToRaw,
  convertFromRaw,
  ContentState,
  ContentBlock,
  genKey,
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
const TITLE_STORAGE_KEY = "documentTitle";

const createEmptyContentState = (numberOfLines = 40) => {
  const blocks = Array(numberOfLines)
    .fill()
    .map(
      () =>
        new ContentBlock({
          key: genKey(),
          text: "",
          type: "unstyled",
          characterList: [],
        })
    );

  // Create content state with empty blocks
  return ContentState.createFromBlockArray(blocks);
};

const ALIGNMENTS = {
  LEFT: "left",
  CENTER: "center",
  RIGHT: "right",
};

const NewDocumentPage = ({
  newDocumentPage,
  setNewDocumentPage,
  setShowAllFiles,
  setBgLogoOn,
  setHideSearchSection,
}) => {
  const [documentTitle, setDocumentTitle] = useState(() => {
    return localStorage.getItem(TITLE_STORAGE_KEY) || "New Document";
  });

  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem(STORAGE_KEY);
    if (savedContent) {
      return EditorState.createWithContent(
        convertFromRaw(JSON.parse(savedContent))
      );
    }
    return EditorState.createWithContent(createEmptyContentState(40));
  });

  const [currentColor, setCurrentColor] = useState("BLACK");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const editorRef = useRef(null);

  /* LOCAL STORAGE */

  useEffect(() => {
    const content = editorState.getCurrentContent();
    const rawContent = convertToRaw(content);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rawContent));
  }, [editorState]);

  useEffect(() => {
    localStorage.setItem(TITLE_STORAGE_KEY, documentTitle);
  }, [documentTitle]);

  const handleTitleChange = (e) => {
    setDocumentTitle(e.target.value);
  };

  /* STYLING AND FUNCTIONALITY */

  const getCurrentAlignment = (editorState) => {
    const selection = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    const currentBlock = currentContent.getBlockForKey(selection.getStartKey());
    return currentBlock.getData().get("alignment") || ALIGNMENTS.LEFT;
  };

  const toggleAlignment = (alignment, e) => {
    e.preventDefault();

    const selection = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();

    // Get all selected blocks
    const startKey = selection.getStartKey();
    const endKey = selection.getEndKey();
    const blockMap = currentContent.getBlockMap();

    let newContentState = currentContent;

    // If selection is collapsed, only apply to current block
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
      // Apply alignment to all blocks in selection
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

  const handleReturn = (e) => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const currentBlock = contentState.getBlockForKey(selection.getStartKey());
    const blockData = currentBlock.getData();

    // Create a new block with the same alignment as the current block
    const newContentState = Modifier.splitBlock(contentState, selection);
    const newKey = newContentState
      .getBlockAfter(currentBlock.getKey())
      .getKey();
    const newEditorState = EditorState.push(
      editorState,
      Modifier.setBlockData(
        newContentState,
        newContentState.getSelectionAfter(),
        blockData
      ),
      "split-block"
    );

    setEditorState(newEditorState);
    return "handled";
  };

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

  const blockStyleFn = (contentBlock) => {
    const alignment = contentBlock.getData().get("alignment");
    switch (alignment) {
      case ALIGNMENTS.LEFT:
        return "align-left";
      case ALIGNMENTS.CENTER:
        return "align-center";
      case ALIGNMENTS.RIGHT:
        return "align-right";
      default:
        return "align-left"; // Default alignment
    }
  };

  const backToAllFileView = () => {
    setBgLogoOn(true);
    setShowAllFiles(true);
    setNewDocumentPage(false);
    setHideSearchSection(false);
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

  const deleteDocument = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this document? This action cannot be undone."
      )
    ) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TITLE_STORAGE_KEY);
      setEditorState(EditorState.createEmpty());
      setDocumentTitle("New Document");
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

  /* COLOR PICKER */

  const toggleColorPicker = (e) => {
    e.preventDefault();
    setShowColorPicker(!showColorPicker);
  };

  const selectColor = (color) => {
    applyColor(color.style);
    setShowColorPicker(false);
  };

  const applyColor = useCallback(
    (color) => {
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

  const styleMap = {
    BLACK: { color: "black" },
    RED: { color: "red" },
    GREEN: { color: "green" },
    BLUE: { color: "blue" },
    PURPLE: { color: "purple" },
    ORANGE: { color: "orange" },
  };

  if (!newDocumentPage) return null;

  const currentAlignment = getCurrentAlignment(editorState);

  return (
    <div className="textEditorScreenDiv">
      <div className="newFileTopDiv">
        <div className="backButtonDiv">
          <button
            className="newDocBackButton individualFileBackButton"
            onClick={backToAllFileView}
          >
            <i className="fa-solid fa-left-long backButtonIcon"></i>
            Back
          </button>
        </div>
        <div className="documentNameDiv">
          <input
            type="text"
            value={documentTitle}
            onChange={handleTitleChange}
            className="documentNameInput"
            placeholder="Enter document name"
          />
        </div>
        <hr />
        <div className="styleButtonsDiv">
          <div className="tooltip-wrapper">
            <span className="tooltip">Bold</span>
            <button
              onMouseDown={(e) => toggleInlineStyle("BOLD", e)}
              className={`boldButton editStyleButton ${
                editorState.getCurrentInlineStyle().has("BOLD")
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
                editorState.getCurrentInlineStyle().has("ITALIC")
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
                editorState.getCurrentInlineStyle().has("UNDERLINE")
                  ? "bg-gray-300"
                  : ""
              }`}
            >
              <i className="fas fa-underline"></i>
            </button>
          </div>

          {/* Alignment buttons */}
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

          {/* Color picker */}
          <div className="colorButtonDiv tooltip-wrapper">
            <span className="tooltip">Text Color</span>
            <button
              onMouseDown={toggleColorPicker}
              className="editStyleButton"
              style={{
                color:
                  COLORS.find((c) => c.style === currentColor)?.hex ||
                  "#000000",
              }}
            >
              <i
                className="fas fa-palette"
                style={{
                  color:
                    COLORS.find((c) => c.style === currentColor)?.hex ||
                    "#000000",
                }}
              />
            </button>
            {showColorPicker && (
              <div className="colorsDiv">
                {COLORS.map((color) => (
                  <button
                    key={color.style}
                    onMouseDown={(e) => {
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
              <span className="tooltip">Save as PDF</span>
              <button onClick={saveAsPDF} className="editStyleButton">
                <i className="fa-solid fa-file-arrow-up"></i>
              </button>
            </div>

            <div className="tooltip-wrapper">
              <span className="tooltip">Delete Document</span>
              <button onClick={deleteDocument} className="editStyleButton">
                <i className="fa-solid fa-file-excel"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div ref={editorRef} className="textEditorDiv">
        <style>
          {`
          .align-left { text-align: left; }
          .align-center { text-align: center; }
          .align-right { text-align: right; }
        `}
        </style>
        <Editor
          editorState={editorState}
          onChange={onChange}
          handleKeyCommand={handleKeyCommand}
          handleReturn={handleReturn}
          handleBeforeInput={handleBeforeInput}
          customStyleMap={styleMap}
          blockStyleFn={blockStyleFn}
        />
      </div>
    </div>
  );
};

export default NewDocumentPage;
