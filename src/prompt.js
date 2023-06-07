const { PromptTemplate } = require("langchain/prompts");

const user_message = async (q, c) => {
  const userPrompt = PromptTemplate.fromTemplate(`INITIAL_QUERY: {query}
  
  OUTPUT:
  
  {context}
  
  ==== 
  
  Format to give answer:
  
  Observation: <observation>
  
  Thought: <thought>
  
  Action: <action>`);
  const userMessage = await userPrompt.format({
    query: q,
    context: c
  });

  return userMessage;
};

const final_message = async (c) => {
  const finalPrompt = PromptTemplate.fromTemplate(`Now, Here is the output of 2nd Search and Please take the answer action , no need of further search.
  
  {context}
  
  ==== 
  
  Format to give answer:
  
  Observation: <observation>
  
  Thought: <thought>
  
  Action: <action>`);
  const finalMessage = await finalPrompt.format({
    context: c
  });

  return finalMessage;
};

let sys_prompt = `You are a search system for Document QnA. You have the access to the database. For a  complex search query database output is limited.
So, If given context isn't enough to, answer the search query, then return another search action else answer.

Actions-Format:
@search: <query>
@answer: <ans>

e,g if query need details of both blackhole and human, and you have only information about human then return a search about human.
`;

module.exports = { user_message, sys_prompt, final_message };
