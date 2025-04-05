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
import TextEditorButtons from "./TextEditorButtons";

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
  files,
  selectedUserCreatedFile,
  setIsLoadingFiles,
  handleAddTag,
  handleRemoveTag,
}) => {
  const [documentTitle, setDocumentTitle] = useState("New Document");
  const [editorState, setEditorState] = useState(() =>
    EditorState.createWithContent(createEmptyContentState(40))
  );

  const [newTag, setNewTag] = useState("");
  const [documentTags, setDocumentTags] = useState([]);
  const [showTags, setShowTags] = useState(false);
  const tagsRef = useRef(null);

  useEffect(() => {
    if (selectedUserCreatedFile) {
      setDocumentTitle(selectedUserCreatedFile.name.replace(/\.txt$/, ""));
      setDocumentTags(selectedUserCreatedFile.tags || []);

      if (selectedUserCreatedFile.fileContent) {
        try {
          const parsedContent = JSON.parse(selectedUserCreatedFile.fileContent);
          if (
            parsedContent &&
            parsedContent.blocks &&
            Array.isArray(parsedContent.blocks)
          ) {
            const newState = EditorState.createWithContent(
              convertFromRaw(parsedContent)
            );
            setEditorState(newState);
          }
        } catch (e) {
          console.error("Error parsing file content:", e);
          if (selectedUserCreatedFile.text) {
            const contentState = ContentState.createFromText(
              selectedUserCreatedFile.text
            );
            setEditorState(EditorState.createWithContent(contentState));
          }
        }
      }
    }
  }, [selectedUserCreatedFile]);

  const editorRef = useRef(null);

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

  const resetEditor = () => {
    setEditorState(EditorState.createWithContent(createEmptyContentState(40)));
    setDocumentTitle("New Document");
  };

  const backToAllFileView = () => {
    resetEditor();
    setBgLogoOn(true);
    setShowAllFiles(true);
    setNewDocumentPage(false);
    setHideSearchSection(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tagsRef.current && !tagsRef.current.contains(event.target)) {
        setShowTags(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddTagToDocument = async () => {
    if (!newTag.trim()) return;

    if (selectedUserCreatedFile?.id) {
      // For existing files
      const updatedTags = await handleAddTag(
        selectedUserCreatedFile.id,
        newTag,
        documentTags
      );

      if (updatedTags) {
        setDocumentTags(updatedTags);
      }
    } else {
      // For new files (not yet saved)
      if (!documentTags.includes(newTag.trim())) {
        setDocumentTags([...documentTags, newTag.trim()]);
      }
    }

    setNewTag("");
    setShowTags(true);
  };

  const handleRemoveTagFromDocument = async (index) => {
    if (selectedUserCreatedFile?.id) {
      // For existing files
      const updatedTags = await handleRemoveTag(
        selectedUserCreatedFile.id,
        index,
        documentTags
      );

      if (updatedTags) {
        setDocumentTags(updatedTags);
      }
    } else {
      // For new files (not yet saved)
      const updatedTags = [...documentTags];
      updatedTags.splice(index, 1);
      setDocumentTags(updatedTags);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAddTagToDocument(); // Change handleAddTag() to handleAddTagToDocument()
    }
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
        <div className="newDocTagsInputDiv" ref={tagsRef}>
          <div className="tooltip-wrapper">
            <span className="tooltip">
              {showTags ? "Hide tags list" : "Show tags list"}
            </span>
            <button
              className="toggleTagView"
              onClick={() => setShowTags(!showTags)}
            >
              <i
                className={`fa-solid tagDisplayArrow ${
                  showTags ? "fa-angle-up" : "fa-angle-down"
                }`}
              ></i>
            </button>
          </div>
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag"
            className="addATagBar"
            onKeyDown={handleKeyDown}
          />
          <button
            className="addTagButton"
            onClick={handleAddTagToDocument} // Change handleAddTag to handleAddTagToDocument
            disabled={!newTag.trim()}
          >
            <i className="fa-solid fa-plus"></i>
          </button>

          {showTags && (
            <div className="newDocTagsList">
              {documentTags.map((tag, index) => (
                <div key={index} className="tag">
                  <button
                    className="tagDeleteButton"
                    onClick={() => handleRemoveTagFromDocument(index)} // Change handleRemoveTag to handleRemoveTagFromDocument
                  >
                    x
                  </button>
                  <span>{tag}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <TextEditorButtons
          editorState={editorState}
          setEditorState={setEditorState}
          editorRef={editorRef}
          documentTitle={documentTitle}
          backToAllFileView={backToAllFileView}
          setFiles={setFiles}
          files={files}
          selectedUserCreatedFile={selectedUserCreatedFile}
          documentTags={documentTags}
          setIsLoadingFiles={setIsLoadingFiles}
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
