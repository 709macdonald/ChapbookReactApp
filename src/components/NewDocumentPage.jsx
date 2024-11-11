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
import { List, Map } from "immutable";
import "draft-js/dist/Draft.css";

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
          characterList: List(),
          depth: 0,
          data: Map(),
        })
    );

  return ContentState.createFromBlockArray(blocks);
};

const styleMap = {
  BLACK: { color: "black" },
  RED: { color: "red" },
  GREEN: { color: "green" },
  BLUE: { color: "blue" },
  PURPLE: { color: "purple" },
  ORANGE: { color: "orange" },
};

const NewDocumentPage = ({
  newDocumentPage,
  setNewDocumentPage,
  setShowAllFiles,
  setBgLogoOn,
  setHideSearchSection,
  setFiles,
  selectedUserCreatedFile = null,
}) => {
  const [documentTitle, setDocumentTitle] = useState(() => {
    if (selectedUserCreatedFile) {
      return selectedUserCreatedFile.name.replace(/\.txt$/, "");
    }
    return localStorage.getItem(TITLE_STORAGE_KEY) || "New Document";
  });

  const [editorState, setEditorState] = useState(() => {
    if (selectedUserCreatedFile) {
      try {
        const content = JSON.parse(selectedUserCreatedFile.fileContent);
        return EditorState.createWithContent(convertFromRaw(content));
      } catch (e) {
        console.error("Error loading draft content:", e);
        return EditorState.createWithContent(createEmptyContentState(40));
      }
    }

    const savedContent = localStorage.getItem(STORAGE_KEY);
    if (savedContent) {
      try {
        return EditorState.createWithContent(
          convertFromRaw(JSON.parse(savedContent))
        );
      } catch (e) {
        return EditorState.createWithContent(createEmptyContentState(40));
      }
    }
    return EditorState.createWithContent(createEmptyContentState(40));
  });

  const editorRef = useRef(null);

  useEffect(() => {
    if (editorState) {
      try {
        const content = editorState.getCurrentContent();
        const rawContent = convertToRaw(content);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rawContent));
      } catch (e) {
        console.error("Error saving to localStorage:", e);
      }
    }
  }, [editorState]);

  useEffect(() => {
    localStorage.setItem(TITLE_STORAGE_KEY, documentTitle);
  }, [documentTitle]);

  const handleTitleChange = (e) => {
    setDocumentTitle(e.target.value);
  };

  const handleReturn = (e) => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const currentBlock = contentState.getBlockForKey(selection.getStartKey());
    const blockData = currentBlock.getData();

    const newContentState = Modifier.splitBlock(contentState, selection);
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

  const handleBeforeInput = useCallback((chars, editorState) => {
    return "not-handled";
  }, []);

  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  const onChange = useCallback((newEditorState) => {
    setEditorState(newEditorState);
  }, []);

  const blockStyleFn = (contentBlock) => {
    const alignment = contentBlock.getData().get("alignment");
    switch (alignment) {
      case "left":
        return "align-left";
      case "center":
        return "align-center";
      case "right":
        return "align-right";
      default:
        return "align-left";
    }
  };

  const backToAllFileView = () => {
    setBgLogoOn(true);
    setShowAllFiles(true);
    setNewDocumentPage(false);
    setHideSearchSection(false);
  };

  if (!newDocumentPage) return null;

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
        <TextEditorButtons
          editorState={editorState}
          setEditorState={setEditorState}
          editorRef={editorRef}
          documentTitle={documentTitle}
          backToAllFileView={backToAllFileView}
          setFiles={setFiles}
        />
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
