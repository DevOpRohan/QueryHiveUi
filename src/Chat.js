import React, { useState } from "react";
import { Button, TextField, Typography } from "@material-ui/core";

const SERVER_URL = "https://monkfish-app-vxijg.ondigitalocean.app";

const Chat = ({ documentData }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

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
      setResults(sortedSimilarities.slice(0, 3));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <TextField
        label="Search"
        value={query}
        onChange={handleQueryChange}
        fullWidth
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSearch}
        style={{ marginTop: "16px" }}
      >
        Search
      </Button>
      {results.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <Typography variant="h6">Top 3 Results:</Typography>
          <ol>
            {results.map((result, index) => (
              <li key={index}>
                <Typography variant="h6">
                  {result.title} - {result.heading}
                </Typography>
                <Typography>{result.content}</Typography>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default Chat;
