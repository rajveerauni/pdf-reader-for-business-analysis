import { render, screen } from "@testing-library/react";

import { InsightsDashboard } from "./InsightsDashboard";

describe("InsightsDashboard", () => {
  it("shows empty-state summary when no insights exist", () => {
    render(<InsightsDashboard insights={null} isLoading={false} />);
    expect(
      screen.getByText("Upload and analyze a business document to generate insights."),
    ).toBeInTheDocument();
  });
});
