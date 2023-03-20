import React from "react";
import { Card, CardContent, Typography } from "@material-ui/core";

const AnswerCard = ({ answer }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Answer:</Typography>
        <Typography>{answer}</Typography>
      </CardContent>
    </Card>
  );
};

export default AnswerCard;
