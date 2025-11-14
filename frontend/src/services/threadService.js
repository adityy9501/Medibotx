// import api from './api';

// export const threadService = {
//   async createThread(title = 'New Conversation', isGuest = false) {
//     const response = await api.post('/api/threads/', { title, is_guest: isGuest });
//     return response.data;
//   },

//   async getThreads() {
//     const response = await api.get('/api/threads/');
//     return response.data;
//   },

//   async getThread(threadId) {
//     const response = await api.get(`/api/threads/${threadId}`);
//     return response.data;
//   },

//   async deleteThread(threadId) {
//     const response = await api.delete(`/api/threads/${threadId}`);
//     return response.data;
//   },

//   async getThreadMessages(threadId) {
//     const response = await api.get(`/api/threads/${threadId}/messages`);
//     return response.data;
//   },
// };
import api from './api';

export const threadService = {
  async createThread(title = 'New Conversation', isGuest = false) {
    const response = await api.post('/api/threads/', { title, is_guest: isGuest });
    return response.data;
  },

  async getThreads() {
    const response = await api.get('/api/threads/');
    return response.data;
  },

  async getThread(threadId) {
    const response = await api.get(`/api/threads/${threadId}`);
    return response.data;
  },

  async deleteThread(threadId) {
    const response = await api.delete(`/api/threads/${threadId}`);
    return response.data;
  },

  async getThreadMessages(threadId) {
    const response = await api.get(`/api/threads/${threadId}/messages`);
    return response.data;
  },

  // ✨ NEW: Update thread title
  async updateThread(threadId, title) {
    const response = await api.put(`/api/threads/${threadId}`, null, {
      params: { title }
    });
    return response.data;
  },
};
