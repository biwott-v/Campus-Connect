import React from 'react';

const FileUpload = ({ onFileChange, currentFile }) => {
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  return (
    <div className="file-upload">
      <label className="file-upload-label">
        <input 
          type="file" 
          onChange={handleFileChange}
          accept=".pdf,.docx,.pptx,.txt,.jpg,.png"
        />
        <div className="file-upload-content">
          <div className="file-upload-icon">📤</div>
          <div className="file-upload-text">
            <p>Click to upload or drag and drop</p>
            <p className="file-types">PDF, DOCX, PPTX, TXT, JPG, PNG (MAX. 10MB)</p>
          </div>
        </div>
      </label>
      
      {currentFile && (
        <div className="file-preview">
          <span>{currentFile.name}</span>
          <button 
            onClick={() => onFileChange(null)}
            className="remove-file"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;