import React from "react";
import "./Toolbar.scss"; // 引入样式文件

const Toolbar = ({ onAction }) => {
  const handleButtonClick = (action) => {
    console.log(`${action} button clicked`);
    onAction(action);
  };

  return (
    <div className="toolbar">
      {/* <button
        onClick={() => handleButtonClick("Highlight")}
        className="toolbar-button"
      >
        <span className="icon">A</span> Highlight
      </button> */}
      {/* <div className="divider" /> */}
      <button
        style={{
          width: "66px",
        }}
        onClick={() => handleButtonClick("Comment")}
        className="toolbar-button"
      >
        <span className="icon">💬</span> Comment
      </button>
      <div className="divider" />
      <button
        style={{
          width: "66px",
        }}
        onClick={() => handleButtonClick("Copy")}
        className="toolbar-button"
      >
        <span className="icon">📋</span> Copy
      </button>
      {/* <div className="divider" /> */}
      {/* <button
        onClick={() => handleButtonClick("Share")}
        className="toolbar-button"
      >
        <span className="icon">🔗</span> Share
      </button>
      <div className="divider" />
      <button
        onClick={() => handleButtonClick("Ask AI")}
        className="toolbar-button"
      >
        <span className="icon">🤖</span> Ask AI
      </button> */}
    </div>
  );
};

export default Toolbar;
