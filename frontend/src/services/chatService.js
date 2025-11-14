import { API_BASE_URL } from './api';

export const chatService = {
  streamChat(threadId, message, onChunk, onComplete, onError) {
    const token = localStorage.getItem('token');
    const controller = new AbortController();
    
    console.log('🚀 Starting stream for thread:', threadId);
    console.log('📝 Message:', message);
    
    fetch(`${API_BASE_URL}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        thread_id: threadId,
        message: message,
      }),
      signal: controller.signal,
    })
      .then(async (response) => {
        console.log('✅ Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Error response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('✅ Stream complete');
            if (onComplete) onComplete();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop();

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6);
              try {
                const data = JSON.parse(jsonStr);
                console.log('📦 Received data:', data);
                
                if (data.error) {
                  console.error('❌ Stream error:', data.error);
                  if (onError) onError(data.error);
                  return;
                }
                
                if (data.done) {
                  console.log('✅ Stream marked as done');
                  if (onComplete) onComplete();
                  return;
                }
                
                if (data.content) {
                  console.log('📝 Chunk:', data.content);
                  if (onChunk) onChunk(data.content);
                }
              } catch (e) {
                console.error('❌ Failed to parse SSE data:', e);
              }
            }
          }
        }
      })
      .catch((error) => {
        console.error('❌ Fetch error:', error);
        if (error.name !== 'AbortError' && onError) {
          onError(error.message);
        }
      });

    return () => controller.abort();
  },
};
