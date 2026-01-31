import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
// import { AgentExecutor, createReactAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { DynamicTool } from "@langchain/core/tools";
import axios from "axios";

interface ResearchResult {
  sources: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  keywords: string[];
  summary: string;
}

interface UserApiKeys {
  openai?: string;
  anthropic?: string;
  perplexity?: string;
}

/**
 * Create a web search tool using Perplexity API
 */
function createPerplexitySearchTool(apiKey: string) {
  return new DynamicTool({
    name: "perplexity_search",
    description:
      "Search the web for current information about a topic. Returns articles, research, and news. Input should be a search query.",
    func: async (query: string) => {
      try {
        const response = await axios.post(
          "https://api.perplexity.ai/chat/completions",
          {
            model: "llama-3.1-sonar-small-128k-online",
            messages: [
              {
                role: "system",
                content:
                  "You are a research assistant. Provide comprehensive information with citations and sources.",
              },
              {
                role: "user",
                content: `Research the following topic thoroughly, including books, academic research, and recent news: ${query}`,
              },
            ],
            max_tokens: 2000,
            return_citations: true,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
          }
        );

        const content = response.data.choices[0].message.content;
        const citations = response.data.citations || [];

        return JSON.stringify({
          content,
          citations,
        });
      } catch (error) {
        console.error("Perplexity search error:", error);
        return "Search failed. Please try again.";
      }
    },
  });
}

/**
 * Create a book and academic search tool
 */
function createBookSearchTool(openaiKey: string) {
  return new DynamicTool({
    name: "book_search",
    description:
      "Search for famous books and academic works related to a topic. Returns book titles, authors, and key concepts.",
    func: async (query: string) => {
      try {
        // Use OpenAI to synthesize knowledge about books
        const response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-4-turbo-preview",
            messages: [
              {
                role: "system",
                content: `You are a librarian and academic researcher. When given a topic, 
                list the most influential and famous books, research papers, and academic 
                works related to that topic. Include author names, publication years, and 
                brief descriptions of key concepts from each work.`,
              },
              {
                role: "user",
                content: `List the most famous and influential books and academic works about: ${query}`,
              },
            ],
            max_tokens: 1500,
          },
          {
            headers: {
              Authorization: `Bearer ${openaiKey}`,
              "Content-Type": "application/json",
            },
          }
        );

        return response.data.choices[0].message.content;
      } catch (error) {
        console.error("Book search error:", error);
        return "Book search failed. Please try again.";
      }
    },
  });
}

/**
 * Research Agent using LangChain
 * Researches a topic using multiple sources: web, books, and news
 */
export async function createResearchAgent(
  topic: string,
  apiKeys: UserApiKeys
): Promise<ResearchResult> {
  // Determine which LLM to use
  const llm = apiKeys.openai
    ? new ChatOpenAI({
        modelName: "gpt-4-turbo-preview",
        temperature: 0.3,
        openAIApiKey: apiKeys.openai,
      })
    : new ChatAnthropic({
        modelName: "claude-3-5-sonnet-20241022",
        temperature: 0.3,
        anthropicApiKey: apiKeys.anthropic,
      });

  // Create tools
  const tools = [];

  if (apiKeys.perplexity) {
    tools.push(createPerplexitySearchTool(apiKeys.perplexity));
  }

  if (apiKeys.openai) {
    tools.push(createBookSearchTool(apiKeys.openai));
  }

  // Create the research prompt
  const systemPrompt = `You are a professional content researcher specializing in creating 
educational video scripts. Your task is to research a topic thoroughly and gather information 
from multiple sources including:

1. Famous books and literature on the topic
2. Academic research and journals
3. Recent news and current events
4. Expert opinions and quotes

When researching, focus on:
- Key facts and statistics that are engaging
- Emotional stories or examples
- Historical context
- Current relevance and implications
- Diverse perspectives

After gathering information, synthesize it into a comprehensive research summary that can 
be used to create an engaging 1-2 minute video script.

Topic to research: {input}

{agent_scratchpad}`;

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"],
  ]);

  // Create and run the agent
  if (tools.length > 0) {
    const agent = await createReactAgent({
      llm,
      tools,
      prompt,
    });

    const agentExecutor = new AgentExecutor({
      agent,
      tools,
      maxIterations: 5,
      verbose: true,
    });

    const result = await agentExecutor.invoke({
      input: topic,
    });

    // Parse the result and extract structured data
    return parseResearchResult(result.output);
  } else {
    // Fallback: Direct LLM call without tools
    const response = await llm.invoke([
      {
        role: "system",
        content: `You are a professional content researcher. Research the topic and provide:
1. A comprehensive summary
2. Key facts and statistics
3. Famous books/works related to the topic
4. Recent developments
5. Engaging stories or examples

Format your response as a research brief that can be used to create a video script.`,
      },
      {
        role: "user",
        content: `Research this topic for a short video: ${topic}`,
      },
    ]);

    return parseResearchResult(
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content)
    );
  }
}

/**
 * Parse research result into structured format
 */
function parseResearchResult(output: string): ResearchResult {
  // Extract sources from citations or URLs mentioned
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = output.match(urlRegex) || [];

  const sources = urls.slice(0, 5).map((url, index) => ({
    title: `Source ${index + 1}`,
    url: url,
    snippet: "",
  }));

  // Extract keywords using common patterns
  const keywords = extractKeywords(output);

  return {
    sources,
    keywords,
    summary: output,
  };
}

/**
 * Extract keywords from research text
 */
function extractKeywords(text: string): string[] {
  // Simple keyword extraction - look for capitalized terms and repeated important words
  const words = text.split(/\s+/);
  const wordFreq: Record<string, number> = {};

  words.forEach((word) => {
    const cleaned = word.toLowerCase().replace(/[^a-z]/g, "");
    if (cleaned.length > 4) {
      wordFreq[cleaned] = (wordFreq[cleaned] || 0) + 1;
    }
  });

  // Get top keywords by frequency
  const sorted = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);

  return sorted;
}

export default createResearchAgent;
