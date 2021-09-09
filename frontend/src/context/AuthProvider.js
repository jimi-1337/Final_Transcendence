import { createContext, useEffect, useState } from "react";

export const userContext = createContext({
  isLoading: true,
  isLoggedIn: false,
  user: undefined,
  token: undefined,
  avatar: undefined,
  auth: false,
});

