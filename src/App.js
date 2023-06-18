import React, { useState } from "react";
import {
  IconButton,
  Typography,
  AppBar,
  Toolbar,
  Box
} from "@material-ui/core";
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
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <img
              src="https://th.bing.com/th/id/OIG.hXSu7UIy7_kupZYXRajK?pid=ImgGn"
              alt="logo"
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                marginRight: "6%"
              }}
            />

            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              QueryHive
            </Typography>
          </Toolbar>
        </AppBar>
      </Box>

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
