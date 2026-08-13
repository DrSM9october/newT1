export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaChatOptions {
  model?: string;
  baseUrl?: string;
  temperature?: number;
  systemPrompt?: string;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  message: OllamaMessage;
  done: boolean;
}

export async function chatWithOllama(
  messages: OllamaMessage[],
  options: OllamaChatOptions = {}
): Promise<string> {
  const {
    model = 'qwen2.5:latest',
    baseUrl = 'http://localhost:11434',
    temperature = 0.7,
    systemPrompt,
  } = options;

  const formattedMessages: OllamaMessage[] = [];

  if (systemPrompt) {
    formattedMessages.push({
      role: 'system',
      content: systemPrompt,
    });
  }

  formattedMessages.push(...messages);

  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        stream: false,
        options: {
          temperature,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API HTTP error! status: ${response.status}`);
    }

    const data: OllamaResponse = await response.json();
    return data.message?.content ?? '';
  } catch (error) {
    console.error('Failed to communicate with Ollama service:', error);
    throw error;
  }
}

export async function* streamChatWithOllama(
  messages: OllamaMessage[],
  options: OllamaChatOptions = {}
): AsyncGenerator<string, void, unknown> {
  const {
    model = 'qwen2.5:latest',
    baseUrl = 'http://localhost:11434',
    temperature = 0.7,
    systemPrompt,
  } = options;

  const formattedMessages: OllamaMessage[] = [];

  if (systemPrompt) {
    formattedMessages.push({
      role: 'system',
      content: systemPrompt,
    });
  }

  formattedMessages.push(...messages);

  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        stream: true,
        options: {
          temperature,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama Streaming HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is null');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const parsed = JSON.parse(trimmed) as OllamaResponse;
          if (parsed.message?.content) {
            yield parsed.message.content;
          }
        } catch (err) {
          console.warn('Failed to parse Ollama chunk line:', err);
        }
      }
    }

    if (buffer.trim()) {
      try {
        const parsed = JSON.parse(buffer.trim()) as OllamaResponse;
        if (parsed.message?.content) {
          yield parsed.message.content;
        }
      } catch {
        // ignore trailing chunk parse error
      }
    }
  } catch (error) {
    console.error('Streaming error:', error);
    throw error;
  }
}
