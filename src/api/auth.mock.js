//mock data for login

export const login = async ({ email, password }) => {
  await new Promise((r) => setTimeout(r, 600));

  if (!email || !password) {
    throw new Error("Invalid credentials");
  }

  const users = {
    "new@demo.com": {
      id: 1,
      name: "New User",
      role: "tester",
      email,
      onboarding: {
        profileCompleted: false,
        questionnaireCompleted: false,
      },
    },
    "done@demo.com": {
      id: 2,
      name: "Completed User",
      role: "tester",
      email,
      onboarding: {
        profileCompleted: true,
        questionnaireCompleted: true,
      },
    },
  };

  const user = users[email] ?? users["new@demo.com"];

  return {
    user,
    token: "mock-token",
  };
};
