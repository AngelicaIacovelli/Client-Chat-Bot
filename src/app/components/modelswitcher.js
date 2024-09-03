"use client";

import React from "react";

// For switching the AI model
const ModelSwitcher = ({ selectedModel, onSelectModel }) => {
  return (
    <div className="model-switcher">
      <label htmlFor="model-select">Choose Model: </label>
      <select
        id="model-select"
        value={selectedModel}
        onChange={(e) => onSelectModel(e.target.value)}
      >
        <option value="gpt-4">ChatGPT 4</option>
        <option value="claude">Claude</option>
      </select>

      <style jsx>{`
        .model-switcher {
          margin-bottom: 20px;
        }
        select {
          padding: 5px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default ModelSwitcher;
