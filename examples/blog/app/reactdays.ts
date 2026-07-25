import { ReactDaysClient } from "@reactdays/react";

// A single shared client for the app. With REACTDAYS_API_KEY, REACTDAYS_ORG,
// and REACTDAYS_PROJECT set in the environment, no arguments are needed.
export const reactdays = new ReactDaysClient();
