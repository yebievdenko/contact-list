import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import type { Contact } from "./types/contact";
import { apiData } from "./api";

jest.mock("./api", () => ({
  BATCH_SIZE: 10,
  apiData: jest.fn(),
}));

// Keep tests focused on app behavior, not react-window internals.
jest.mock("react-window", () => ({
  List: ({ className, rowComponent: Row, rowCount, rowProps }: any) => (
    <div className={className}>
      {Array.from({ length: rowCount }).map((_, index) => (
        <Row
          key={index}
          index={index}
          style={{}}
          ariaAttributes={{
            role: "listitem",
            "aria-posinset": index + 1,
            "aria-setsize": rowCount,
          }}
          {...rowProps}
        />
      ))}
    </div>
  ),
}));

const mockedApiData = apiData as jest.MockedFunction<typeof apiData>;

function makeContacts(start: number, count: number): Contact[] {
  return Array.from({ length: count }, (_, offset) => {
    const value = start + offset;
    return {
      id: String(value),
      firstNameLastName: `Person ${value}`,
      jobTitle: `Job ${value}`,
      emailAddress: `person${value}@example.com`,
    };
  });
}

describe("App", () => {
  beforeEach(() => {
    mockedApiData.mockReset();
  });

  it("loads first page and appends next page on Load more", async () => {
    mockedApiData
      .mockResolvedValueOnce(makeContacts(1, 10))
      .mockResolvedValueOnce(makeContacts(11, 3));

    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText("Selected contacts: 0")).toBeInTheDocument();
    await screen.findByText("Contacts count: 10");

    await user.click(screen.getByRole("button", { name: /load more/i }));

    await screen.findByText("Contacts count: 13");
    expect(mockedApiData).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("button", { name: /load more/i })).toBeDisabled();
  });

  it("shows error on failed page fetch and retries failed phase", async () => {
    mockedApiData
      .mockResolvedValueOnce(makeContacts(1, 10))
      .mockRejectedValueOnce(new Error("Something went wrong"))
      .mockResolvedValueOnce(makeContacts(11, 2));

    const user = userEvent.setup();
    render(<App />);

    await screen.findByText("Contacts count: 10");
    await user.click(screen.getByRole("button", { name: /load more/i }));

    expect(await screen.findByText("Error: Something went wrong")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /retry/i }));

    await screen.findByText("Contacts count: 12");
    expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
    expect(mockedApiData).toHaveBeenCalledTimes(3);
  });

  it("selects, deselects, and moves selected contact to top", async () => {
    mockedApiData.mockResolvedValueOnce([
      {
        id: "1",
        firstNameLastName: "Alice Anderson",
        jobTitle: "Dev",
        emailAddress: "alice@example.com",
      },
      {
        id: "2",
        firstNameLastName: "Bob Brown",
        jobTitle: "QA",
        emailAddress: "bob@example.com",
      },
      {
        id: "3",
        firstNameLastName: "Carol Clark",
        jobTitle: "PM",
        emailAddress: "carol@example.com",
      },
    ]);

    const user = userEvent.setup();
    const { container } = render(<App />);

    await screen.findByText("Alice Anderson");

    const getRenderedNames = () =>
      Array.from(container.querySelectorAll(".person-name")).map((node) =>
        node.textContent?.trim()
      );

    expect(getRenderedNames()).toEqual([
      "Alice Anderson",
      "Bob Brown",
      "Carol Clark",
    ]);

    await user.click(screen.getByText("Bob Brown"));

    await waitFor(() =>
      expect(screen.getByText("Selected contacts: 1")).toBeInTheDocument()
    );
    expect(getRenderedNames()).toEqual([
      "Bob Brown",
      "Alice Anderson",
      "Carol Clark",
    ]);
    expect(
      screen.getByText("Bob Brown").closest(".person-info")
    ).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByText("Bob Brown"));

    await waitFor(() =>
      expect(screen.getByText("Selected contacts: 0")).toBeInTheDocument()
    );
    expect(getRenderedNames()).toEqual([
      "Alice Anderson",
      "Bob Brown",
      "Carol Clark",
    ]);
  });
});
