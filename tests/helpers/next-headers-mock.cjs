let mockCookies = new Map();

const cookieStore = {
  get(name) {
    if (!mockCookies.has(name)) return undefined;
    return { name, value: mockCookies.get(name) };
  },
  getAll() {
    return Array.from(mockCookies.entries()).map(([name, value]) => ({ name, value }));
  },
  set(name, value, options) {
    mockCookies.set(name, value);
  },
  delete(name) {
    mockCookies.delete(name);
  }
};

module.exports = {
  cookies: async () => cookieStore,
  // Helper to set/clear cookies from tests
  __setCookie: (name, value) => {
    mockCookies.set(name, value);
  },
  __clearCookies: () => {
    mockCookies.clear();
  },
  __getCookie: (name) => {
    return mockCookies.get(name);
  }
};
