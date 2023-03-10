import { useState } from "react";
import { Button, Card, CardContent, Typography } from "@material-ui/core";
import CloudUpload from "@material-ui/icons/CloudUpload";

const SERVER_URL = "https://hammerhead-app-cmqaj.ondigitalocean.app";

const UploadDocument = ({ onSessionIdReceived }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(`${SERVER_URL}/upload`, {
        method: "POST",
        body: formData
      });

      const { sessionId } = await response.json();
      console.log(response);
      setSessionId(sessionId);
      onSessionIdReceived(sessionId);
    } catch (error) {
      console.error(error);
    }
  };

  const renderFileInput = () => (
    <>
      <input
        type="file"
        accept=".docx"
        onChange={handleFileChange}
        style={{ display: "none" }}
        id="fileInput"
      />
      <label htmlFor="fileInput">
        <Button
          variant="contained"
          component="span"
          color="primary"
          startIcon={<CloudUpload />}
        >
          Select File
        </Button>
      </label>
    </>
  );

  const renderUploadButton = () => (
    <Button
      variant="contained"
      color="primary"
      onClick={handleUpload}
      disabled={!selectedFile}
      style={{ marginLeft: "16px" }}
    >
      Upload
    </Button>
  );

  return (
    <Card sx={{ width: 300, margin: "auto", marginTop: "50px" }}>
      <CardContent align="center" padding="200px">
        <Typography variant="h4" align="center" gutterBottom>
          Upload Document
        </Typography>
        {sessionId ? null : (
          <>
            {renderFileInput()}
            {renderUploadButton()}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadDocument;
