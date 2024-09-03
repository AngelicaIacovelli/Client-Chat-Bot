"use client";

import React from "react";

// Component to display chat summary
const Summary = ({ summary }) => {
  return (
    <div className="summary-box">
      <h3>Chat Summary</h3>
      <p>{summary}</p>
      <style jsx>{`
        .summary-box {
          background: #e9ecef;
          padding: 10px;
          border-radius: 8px;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};

export default Summary;
