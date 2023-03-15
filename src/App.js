import React, { useState } from "react";
import { IconButton } from "@material-ui/core";
import { Clear } from "@material-ui/icons";
import Chat from "./Chat";
import UploadDocument from "./UploadDocument";

const App = () => {
  const [sessionId, setSessionId] = useState(null);

  const handleSessionIdReceived = (sessionId) => {
    setSessionId(sessionId);
  };

  const handleClearSession = () => {
    fetch(
      `https://monkfish-app-vxijg.ondigitalocean.app/clearSession?id=${sessionId}`,
      {
        method: "DELETE"
      }
    )
      .then((response) => {
        if (response.ok) {
          setSessionId(null);
        } else {
          throw new Error("Failed to clear session");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {!sessionId && (
          <UploadDocument onSessionIdReceived={handleSessionIdReceived} />
        )}
        {sessionId && (
          <IconButton onClick={handleClearSession}>
            <Clear />
          </IconButton>
        )}
      </div>
      {sessionId && <Chat sessionId={sessionId} />}
    </>
  );
};

export default App;
