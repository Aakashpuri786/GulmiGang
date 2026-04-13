const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5007/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5007';

export default {
  API_URL,
  WS_URL,
  endpoints: {
    auth: {
      register: `${API_URL}/auth/register`,
      login: `${API_URL}/auth/login`,
      logout: `${API_URL}/auth/logout`,
      refresh: `${API_URL}/auth/refresh`,
      user: `${API_URL}/auth/user`
    },
    users: {
      profile: (username) => `${API_URL}/users/${username}`,
      me: `${API_URL}/users/me/profile`,
      update: `${API_URL}/users/profile`,
      follow: (userId) => `${API_URL}/users/${userId}/follow`,
      search: `${API_URL}/users/search/all`
    },
    posts: {
      create: `${API_URL}/posts`,
      feed: `${API_URL}/posts/feed`,
      userPosts: (userId) => `${API_URL}/posts/user/${userId}`,
      like: (postId) => `${API_URL}/posts/${postId}/like`,
      comment: (postId) => `${API_URL}/posts/${postId}/comment`
    },
    messages: {
      conversations: `${API_URL}/messages/conversations`,
      send: `${API_URL}/messages`,
      get: (userId) => `${API_URL}/messages/${userId}`
    }
  }
};
