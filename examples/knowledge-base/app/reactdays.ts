import { ReactDaysClient } from "@reactdays/react";

// Shared client. Reads REACTDAYS_API_KEY / REACTDAYS_ORG / REACTDAYS_PROJECT
// from the environment.
export const reactdays = new ReactDaysClient();
