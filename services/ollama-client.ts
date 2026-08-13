const OLLAMA_URL =
  (typeof process !== "undefined" && process.env?.OLLAMA_URL) ||
  "http://127.0.0.1:11434";

const base = OLLAMA_URL.replace(/\/+$/, "");

type ModelCache = {
  model: string;
  at: number;
};

type HardwareInfo = {
  memoryGB?: number;
  cores?: number;
};

type HealthResult = {
  available: boolean;
  models: string[];
};

type GenerateResult = {
  text: string;
  model: string;
};

let cache: ModelCache | null = null;

async function fx(
  url: string,
  init: RequestInit = {},
  timeoutMs = 60000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function health(): Promise<HealthResult> {
  try {
    const response = await fx(`${base}/api/tags`, {}, 5000);

    if (!response.ok) {
      return { available: false, models: [] };
    }

    const data: unknown = await response.json();

    if (
      typeof data !== "object" ||
      data === null ||
      !Array.isArray((data as { models?: unknown }).models)
    ) {
      return { available: true, models: [] };
    }

    const models = (data as { models: unknown[] }).models
      .map((model) => {
        if (
          typeof model === "object" &&
          model !== null &&
          typeof (model as { name?: unknown }).name === "string"
        ) {
          return (model as { name: string }).name;
        }
        return null;
      })
      .filter((name): name is string => name !== null);

    return { available: true, models };
  } catch {
    return { available: false, models: [] };
  }
}

export async function selectModel(
  hw?: HardwareInfo,
): Promise<string | null> {
  if (cache && Date.now() - cache.at < 300000) {
    return cache.model;
  }

  const healthStatus = await health();

  if (!healthStatus.available) {
    return null;
  }

  const memoryGB = hw?.memoryGB ?? 4;

  let candidates: string[];

  if (memoryGB >= 12) {
    candidates = [
      "qwen2.5:7b",
      "qwen2.5:3b",
      "qwen2.5:1.5b",
      "qwen2.5:0.5b",
    ];
  } else if (memoryGB >= 8) {
    candidates = [
      "qwen2.5:3b",
      "qwen2.5:1.5b",
      "qwen2.5:0.5b",
    ];
  } else {
    candidates = ["qwen2.5:1.5b", "qwen2.5:0.5b"];
  }

  const selectedModel =
    candidates.find((model) => healthStatus.models.includes(model)) ?? null;

  if (selectedModel) {
    cache = {
      model: selectedModel,
      at: Date.now(),
    };
  }

  return selectedModel;
}

export async function generate(
  prompt: string,
  system: string,
  hw?: HardwareInfo,
): Promise<GenerateResult> {
  const model = await selectModel(hw);

  if (!model) {
    throw new Error("LOCAL_AI_UNAVAILABLE");
  }

  const response = await fx(`${base}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      stream: false,
      options: {
        temperature: 0.6,
        num_predict: 500,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`OLLAMA_${response.status}`);
  }

  const data: unknown = await response.json();

  let content = "";

  if (
    typeof data === "object" &&
    data !== null &&
    typeof (data as { message?: unknown }).message === "object" &&
    (data as { message?: unknown }).message !== null
  ) {
    const message = (data as { message: { content?: unknown } }).message;

    if (typeof message.content === "string") {
      content = message.content.trim();
    }
  }

  return {
    text: content,
    model,
  };
}
