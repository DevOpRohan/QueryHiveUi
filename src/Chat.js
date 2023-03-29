import React, { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  TextField,
  Typography,
  makeStyles,
  CircularProgress
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import AnswerCard from "./AnswerCard";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2)
  },
  searchField: {
    marginBottom: theme.spacing(2)
  },
  results: {
    marginTop: theme.spacing(2)
  },
  accordionHeading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular
  },
  answerCard: {
    marginTop: theme.spacing(2)
  },
  progress: {
    marginTop: theme.spacing(2),
    display: "flex",
    justifyContent: "center"
  }
}));

const SERVER_URL = "https://monkfish-app-vxijg.ondigitalocean.app";

const Chat = ({ documentData }) => {
  const classes = useStyles();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

  const calculateCosineSimilarity = (embedding1, embedding2) => {
    if (!Array.isArray(embedding1) || !Array.isArray(embedding2)) {
      return 0;
    }

    const dotProduct = embedding1.reduce(
      (sum, value, index) => sum + value * embedding2[index],
      0
    );
    const magnitude1 = Math.sqrt(
      embedding1.reduce((sum, value) => sum + value * value, 0)
    );
    const magnitude2 = Math.sqrt(
      embedding2.reduce((sum, value) => sum + value * value, 0)
    );
    return dotProduct / (magnitude1 * magnitude2);
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `${SERVER_URL}/embedding?query=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const queryEmbedding = await response.json();
      console.log(queryEmbedding);
      const similarities = documentData.sections.map((item) => ({
        ...item,
        similarity: calculateCosineSimilarity(
          item.embedding,
          queryEmbedding.embedding
        )
      }));

      const sortedSimilarities = similarities.sort(
        (a, b) => b.similarity - a.similarity
      );
      const topResults = sortedSimilarities.slice(0, 3);
      setResults(topResults);

      getAnswer(topResults);
    } catch (error) {
      console.error(error);
    }
  };

  const getAnswer = (topResults) => {
    setLoading(true);
    const prompt = `
Using context as refrence, give the answer
context:
\`\`\`
${topResults[0].content}
\`\`\`
\`\`\`
${topResults[1].content}
\`\`\`
\`\`\`
${topResults[2].content}
\`\`\`
Query: ${query}
Ans:
`;

    fetch(`${SERVER_URL}/answer?q=${encodeURIComponent(prompt)}`)
      .then((response) => response.text())
      .then((data) => {
        console.log(data);
        setAnswer(data);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>
        QueryHive
      </Typography>
      <TextField
        label="Search"
        value={query}
        onChange={handleQueryChange}
        fullWidth
        className={classes.searchField}
      />
      <Button variant="contained" color="primary" onClick={handleSearch}>
        Search
      </Button>
      {results.length > 0 && (
        <div className={classes.results}>
          <Typography variant="h6">Top 3 Results:</Typography>
          {results.map((result, index) => (
            <Accordion key={index}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${index + 1}-content`}
                id={`panel${index + 1}-header`}
              >
                <Typography className={classes.accordionHeading}>
                  {result.title} - {result.heading}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{result.content}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      )}
      {loading && (
        <div className={classes.progress}>
          <CircularProgress />
        </div>
      )}
      {answer && (
        <div className={classes.answerCard}>
          <AnswerCard answer={answer} />
        </div>
      )}
    </div>
  );
};

export default Chat;
