import { useState } from "react";
import { Button, Card, CardContent, Typography } from "@material-ui/core";
import CloudUpload from "@material-ui/icons/CloudUpload";

const SERVER_URL = "https://monkfish-app-vxijg.ondigitalocean.app";

const UploadDocument = ({ onDocumentDataReceived }) => {
  const [selectedFile, setSelectedFile] = useState(null);

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

      const data = await response.json();
      console.log(data);
      onDocumentDataReceived(data);
    } catch (error) {
      console.error(error);
    }
  };

  const renderFileInput = () => (
    <>
      <input
        type="file"
        accept=".txt"
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
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        marginLeft: "auto",
        marginRight: "auto"
      }}
    >
      <Card sx={{ width: 300 }}>
        <CardContent align="center" padding="200px">
          <Typography variant="h4" align="center" gutterBottom>
            Upload Document
          </Typography>
          <>
            {renderFileInput()}
            <br />
            <br />
            {renderUploadButton()}
          </>
        </CardContent>
      </Card>
    </div>
  );
};
export default UploadDocument;
