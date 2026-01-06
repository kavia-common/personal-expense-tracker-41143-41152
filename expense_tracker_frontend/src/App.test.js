import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders app heading", () => {
  render(<App />);
  const heading = screen.getByText(/Expense Tracker/i);
  expect(heading).toBeInTheDocument();
});
