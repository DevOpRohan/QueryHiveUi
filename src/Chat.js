import React, { useState, useRef } from "react";
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

import {
  SystemChatMessage,
  HumanChatMessage,
  AIChatMessage
} from "langchain/schema";

import { sys_prompt, user_message, final_message } from "./prompt";
import run from "./ChatLLm";

import { parseActionLine, extractSubQuery, extractAnswer } from "./Parser";

// Define the styles for the Chat component
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

// Server URL for API calls
const SERVER_URL = "https://monkfish-app-vxijg.ondigitalocean.app";

/**
 * Chat component to search and display results based on the query
 * @param {Object} documentData - Data containing sections and embeddings
 */
const Chat = ({ documentData }) => {
  const classes = useStyles();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  // const [history, setHistory] = useState([new SystemChatMessage(sys_prompt)]);
  const historyRef = useRef([new SystemChatMessage(sys_prompt)]);
  // Handle the change in the search query input
  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

  /**
   * Calculate the cosine similarity between two embeddings
   * @param {Array} embedding1 - First embedding
   * @param {Array} embedding2 - Second embedding
   * @returns {number} Cosine similarity between the two embeddings
   */
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

  /**
   * Calculate the Euclidean distance between two embeddings
   * @param {Array} embedding1 - First embedding
   * @param {Array} embedding2 - Second embedding
   * @returns {number} Euclidean distance between the two embeddings
   */
  const calculateEuclideanDistance = (embedding1, embedding2) => {
    if (!Array.isArray(embedding1) || !Array.isArray(embedding2)) {
      return 0;
    }
    return Math.sqrt(
      embedding1.reduce(
        (sum, value, index) => sum + Math.pow(value - embedding2[index], 2),
        0
      )
    );
  };

  // Handle the search button click and fetch results
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

      const sortedSimilarities = similarities.sort((a, b) => {
        // In case of a tie, use Euclidean distance to break the tie
        if (b.similarity === a.similarity) {
          const distanceA = calculateEuclideanDistance(
            a.embedding,
            queryEmbedding.embedding
          );
          const distanceB = calculateEuclideanDistance(
            b.embedding,
            queryEmbedding.embedding
          );
          return distanceA - distanceB;
        }
        return b.similarity - a.similarity;
      });

      // const topResults = sortedSimilarities.slice(0, 3);

      //==Experimental feature to display cosine and euclideanDistance
      const topResults = sortedSimilarities.slice(0, 3).map((result) => {
        const distance = calculateEuclideanDistance(
          result.embedding,
          queryEmbedding.embedding
        );
        return {
          ...result,
          distance
        };
      });

      setResults(topResults);
      console.log(topResults);
      getAnswerFromAI(topResults);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch the answer based on the top results
  const getAnswer = (topResults) => {
    setLoading(true);

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

  const fetchNewResults = async (searchQuery) => {
    try {
      const response = await fetch(
        `${SERVER_URL}/embedding?query=${encodeURIComponent(searchQuery)}`,
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

      const sortedSimilarities = similarities.sort((a, b) => {
        // In case of a tie, use Euclidean distance to break the tie
        if (b.similarity === a.similarity) {
          const distanceA = calculateEuclideanDistance(
            a.embedding,
            queryEmbedding.embedding
          );
          const distanceB = calculateEuclideanDistance(
            b.embedding,
            queryEmbedding.embedding
          );
          return distanceA - distanceB;
        }
        return b.similarity - a.similarity;
      });

      //== Experimental feature to display cosine and euclideanDistance
      const newResults = sortedSimilarities.slice(0, 3).map((result) => {
        const distance = calculateEuclideanDistance(
          result.embedding,
          queryEmbedding.embedding
        );
        return {
          ...result,
          distance
        };
      });

      return newResults;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  // Fetch the answer based on the top results
  const getAnswerFromAI = async (topResults) => {
    try {
      setLoading(true);

      // Extract the content from the top results
      const topResultsContent = topResults
        .map((result) => result.content)
        .join("\n==\n ");

      // Create a user prompt using the user_message function and the top results content
      const userPrompt = await user_message(query, topResultsContent);

      // Update the history array with the user prompt
      historyRef.current = [
        ...historyRef.current,
        new HumanChatMessage(userPrompt)
      ];

      // Call the ChatLLM function run with the updated history as an argument
      const aiResponse = await run(historyRef.current);

      // Append the AI response to the history array as an AIChatMessage
      historyRef.current = [
        ...historyRef.current,
        new AIChatMessage(aiResponse.text)
      ];

      // Parse the AI response using the parseActionLine function to get the action
      const action = parseActionLine(aiResponse.text + "");

      // Check if the action starts with "@search"
      if (action.startsWith("@search")) {
        // Extract the search query using the search function
        const searchQuery = await extractSubQuery(action);

        // Call the handleSearch function with the extracted query
        let newResults = await fetchNewResults(searchQuery);
        console.log(newResults);
        // Append the new results to the previous top results
        const combinedResults = [...topResults, ...newResults];

        // Update the UI with the combined results
        setResults(combinedResults);
        // Append the new top results as a HumanChatMessage
        const newTopResultsContent = newResults
          .map((result) => result.content)
          .join("\n==\n ");

        console.log(newTopResultsContent);

        const finalAnsPrompt = await final_message(newTopResultsContent + "");
        console.log(finalAnsPrompt);
        historyRef.current = [
          ...historyRef.current,
          new HumanChatMessage(finalAnsPrompt)
        ];

        // Call the ChatLLM function run with the updated history as an argument
        const finalResponse = await run(historyRef.current);

        const answerText = extractAnswer(
          parseActionLine(finalResponse.text + "")
        );
        setAnswer(answerText);

        // Clear the history array except for the first message
        historyRef.current = [historyRef.current[0]];
      } else if (action.startsWith("@answer")) {
        // If the action starts with "@answer", display the answer using the answer function
        const answerText = extractAnswer(action);
        setAnswer(answerText);

        // Clear the history array except for the first message
        historyRef.current = [historyRef.current[0]];
      }
    } catch (error) {
      console.error(error);
      historyRef.current = [historyRef.current[0]];
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.root}>
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
          <Typography variant="h6">Top Results:</Typography>
          {results.map((result, index) => (
            <Accordion key={index}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${index + 1}-content`}
                id={`panel${index + 1}-header`}
              >
                {/* Modified this block to, show cosine simlarity and euclidean distance */}
                <Typography className={classes.accordionHeading}>
                  {result.title} - {result.heading} | Cosine Similarity:{" "}
                  {result.similarity.toFixed(4)} | Euclidean Distance:{" "}
                  {result.distance.toFixed(4)}
                </Typography>
                {/* */}
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
