const parseActionLine = (inputString) => {
  const actionRegex = /Observation:.+Thought:.+Action: (.+)/s;
  const match = inputString.match(actionRegex);

  if (match) {
    const actionText = match[1].trim();
    return actionText;
    // search(actionText);
    // answer(actionText);
  } else {
    console.log("Action tag not found in the input string.");
  }
};

const extractSubQuery = async (actionText) => {
  if (actionText.startsWith("@search")) {
    return actionText.substring(8).trim();
  }
};

const extractAnswer = (actionText) => {
  if (actionText.startsWith("@answer")) {
    return actionText.substring(8).trim();
  }
};

export { parseActionLine, extractSubQuery, extractAnswer };
