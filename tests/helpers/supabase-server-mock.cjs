let mockUser = null;
let exchangeError = null;

const supabaseMock = {
  auth: {
    async exchangeCodeForSession(code) {
      if (exchangeError) {
        return { data: { session: null, user: null }, error: exchangeError };
      }
      return { data: { session: {}, user: mockUser || { id: "test-user-id" } }, error: null };
    },
    async getUser() {
      if (mockUser) {
        return { data: { user: mockUser }, error: null };
      }
      return { data: { user: null }, error: new Error("No user session") };
    }
  }
};

module.exports = {
  createServerSupabaseClient: async () => supabaseMock,
  // Helpers to control the mock in tests
  __setMockUser: (user) => {
    mockUser = user;
  },
  __setExchangeError: (error) => {
    exchangeError = error;
  },
  __resetMock: () => {
    mockUser = null;
    exchangeError = null;
  }
};
