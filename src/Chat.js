import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  TextField,
  Typography,
  Button
} from "@material-ui/core";

const Chat = () => {
  const [userMessage, setUserMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const chatContainerRef = useRef(null);

  const handleUserMessageChange = (event) => {
    setUserMessage(event.target.value);
  };

  const handleSendMessage = () => {
    if (userMessage) {
      const botMessage = { message: "Typing...", isBot: true };
      setChatMessages((prevChatMessages) => [
        ...prevChatMessages,
        { message: userMessage, isBot: false },
        botMessage
      ]);
      setIsButtonClicked(true);
    }
  };

  const fetchBotMessage = useCallback(() => {
    fetch(`https://walrus-app-hodhq.ondigitalocean.app/vision?q=${userMessage}`)
      .then((response) => response.text())
      .then((data) => {
        const botMessage = { message: data, isBot: true };
        setChatMessages((prevChatMessages) => [
          ...prevChatMessages.slice(0, -1),
          botMessage
        ]);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [userMessage]);

  useEffect(() => {
    if (isButtonClicked) {
      fetchBotMessage();
      setIsButtonClicked(false);
      setUserMessage("");
    }
    // chatContainerRef.current.scrollTo(0, chatContainerRef.current.scrollHeight);
  }, [isButtonClicked, fetchBotMessage]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <Card style={{ width: "300px", margin: "auto", marginTop: "50px" }}>
      <CardContent>
        <Typography variant="h4" align="center" gutterBottom>
          Vision
        </Typography>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "60vh",
            overflow: "auto"
          }}
          ref={chatContainerRef}
        >
          {chatMessages.map((message, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: message.isBot ? "flex-start" : "flex-end",
                marginBottom: "8px"
              }}
            >
              <Card
                style={{
                  width: "auto",
                  maxWidth: "70%",
                  backgroundColor: message.isBot === false ? "#f7f7f7" : "white"
                }}
              >
                <CardContent
                  style={{
                    padding: "5px"
                  }}
                >
                  <Typography variant="body1" style={{ fontSize: 14 }}>
                    {message.message}
                  </Typography>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <TextField
            fullWidth
            label="Type a message"
            value={userMessage}
            onChange={handleUserMessageChange}
            autoComplete="off"
            autoFocus
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendMessage}
          >
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Chat;
