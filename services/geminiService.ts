/**
 * Client-Side Gemini Service Proxy
 * All requests are routed through the server-side proxy at /api/gemini/*
 * No API keys or SDK imports are exposed to the browser.
 */

export const getWeaverRecommendation = async (userMessage: string): Promise<string> => {
  try {
    const response = await fetch('/api/gemini/stylist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userMessage }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return (
        errorData.error ||
        'The mountain winds are too strong. Please ask again.'
      );
    }

    const data = await response.json();
    return (
      data.text ||
      'The threads are tangled; I cannot see the pattern right now.'
    );
  } catch (error) {
    console.error('Gemini Service Error:', error);
    return 'The mountain winds are too strong. Please ask again.';
  }
};

/**
 * Streams the Master Weaver's recommendation progressively
 */
export const streamWeaverRecommendation = async (
  userMessage: string,
  onChunk: (chunk: string) => void
): Promise<string> => {
  try {
    const response = await fetch('/api/gemini/stylist/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userMessage }),
    });

    if (!response.ok || !response.body) {
      return await getWeaverRecommendation(userMessage);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const raw = decoder.decode(value, { stream: true });
      const lines = raw.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') continue;
          try {
            const parsed = JSON.parse(payload);
            if (parsed.text) {
              accumulatedText += parsed.text;
              onChunk(parsed.text);
            }
          } catch (_) {}
        }
      }
    }

    return accumulatedText || 'The threads are woven.';
  } catch (err) {
    console.error('Stream error, falling back:', err);
    return await getWeaverRecommendation(userMessage);
  }
};

/**
 * Requests styling & drape advice from the Master Weaver for a specific shawl
 */
export const getWeaverDrapeAdvice = async (
  shawlName: string,
  shawlMaterial: string,
  shawlCategory?: string
): Promise<{ text: string; recommendedStyle: 'shoulder' | 'chadar' | 'stole' | 'open' } | null> => {
  try {
    const response = await fetch('/api/gemini/drape-advice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ shawlName, shawlMaterial, shawlCategory }),
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Drape Advice Error:', error);
    return null;
  }
};


/**
 * Connects to the server-side Live API bridge via WebSocket
 */
export const connectLiveWeaver = (callbacks: {
  onAudio?: (base64Audio: string) => void;
  onText?: (text: string) => void;
  onError?: (err: string) => void;
  onClose?: () => void;
}) => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const socketUrl = `${protocol}//${window.location.host}/api/live`;
  const ws = new WebSocket(socketUrl);

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.audio && callbacks.onAudio) {
        callbacks.onAudio(msg.audio);
      }
      if (msg.text && callbacks.onText) {
        callbacks.onText(msg.text);
      }
      if (msg.error && callbacks.onError) {
        callbacks.onError(msg.error);
      }
    } catch (e) {
      console.error('Error parsing live WS message:', e);
    }
  };

  ws.onerror = () => {
    if (callbacks.onError) {
      callbacks.onError('Live connection error.');
    }
  };

  ws.onclose = () => {
    if (callbacks.onClose) {
      callbacks.onClose();
    }
  };

  return {
    sendAudio: (base64Pcm: string) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ audio: base64Pcm }));
      }
    },
    sendText: (text: string) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ text }));
      }
    },
    close: () => {
      ws.close();
    },
  };
};