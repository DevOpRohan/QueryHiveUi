import React, { useState } from "react";
import { IconButton } from "@material-ui/core";
import { Clear } from "@material-ui/icons";
import Chat from "./Chat";
import UploadDocument from "./UploadDocument";

const App = () => {
  const [documentData, setDocumentData] = useState(null);

  const handleDocumentDataReceived = (data) => {
    setDocumentData(data);
  };

  const handleClearDocumentData = () => {
    setDocumentData(null);
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {!documentData && (
          <UploadDocument onDocumentDataReceived={handleDocumentDataReceived} />
        )}
        {documentData && (
          <IconButton onClick={handleClearDocumentData}>
            <Clear />
          </IconButton>
        )}
      </div>
      {documentData && <Chat documentData={documentData} />}
    </>
  );
};

export default App;
