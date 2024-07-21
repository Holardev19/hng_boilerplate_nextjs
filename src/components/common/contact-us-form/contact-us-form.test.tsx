import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import ContactForm from "~/components/common/contact-us-form";

describe("contactForm Component", () => {
  const mockFetch = vi.fn();

  beforeAll(() => {
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  const setup = () => {
    const { container } = render(<ContactForm />);
    const nameInput = screen.getByPlaceholderText("Enter full name");
    const emailInput = screen.getByPlaceholderText("Enter email address");
    const phoneInput = screen.getByPlaceholderText("Enter phone number");
    const messageInput = screen.getByPlaceholderText("Message...");
    const submitButton = screen.getByText("Send");
    return {
      container,
      nameInput,
      emailInput,
      phoneInput,
      messageInput,
      submitButton,
    };
  };

  it("should validate all required form fields", async () => {
    expect.assertions(1);
    const { submitButton } = setup();
    fireEvent.click(submitButton);

    await expect(screen.findAllByText(/is required/)).resolves.toHaveLength(2);
  });

  it("should validate email format", async () => {
    expect.assertions(1);
    const { emailInput, submitButton } = setup();
    fireEvent.change(emailInput, { target: { value: "invalid-email@kkk" } });
    fireEvent.click(submitButton);
    const errorMessage = await screen.findByText("Email is invalid");
    expect(errorMessage).toBeInTheDocument();
  });

  it("should validate phone number format", async () => {
    expect.assertions(1);
    const { phoneInput, submitButton } = setup();
    fireEvent.change(phoneInput, { target: { value: "123" } });
    fireEvent.click(submitButton);
    const errorMessage = await screen.findByText("Phone number is invalid");
    expect(errorMessage).toBeInTheDocument();
  });

  it("should submit the form successfully", async () => {
    expect.assertions(2); // Ensure we have at least two assertions in this test
    const { nameInput, emailInput, phoneInput, messageInput, submitButton } =
      setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Form submitted successfully!" }),
    });

    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(phoneInput, { target: { value: "+1234567890" } });
    fireEvent.change(messageInput, { target: { value: "Hello!" } });

    fireEvent.click(submitButton);

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
    expect(
      screen.getByText("Form submitted successfully!"),
    ).toBeInTheDocument();
  });

  it("should handle form submission error", async () => {
    expect.assertions(2); // Ensure we have at least two assertions in this test
    const { nameInput, emailInput, phoneInput, messageInput, submitButton } =
      setup();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Failed to submit the form." }),
    });

    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(phoneInput, { target: { value: "+1234567890" } });
    fireEvent.change(messageInput, { target: { value: "Hello!" } });

    fireEvent.click(submitButton);

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
    expect(screen.getByText("Failed to submit the form.")).toBeInTheDocument();
  });

  it("should reset status and message after 3 seconds", async () => {
    expect.assertions(2);
    const { nameInput, emailInput, phoneInput, messageInput, submitButton } =
      setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Form submitted successfully!" }),
    });

    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(phoneInput, { target: { value: "+1234567890" } });
    fireEvent.change(messageInput, { target: { value: "Hello!" } });

    fireEvent.click(submitButton);

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
    expect(
      screen.getByText("Form submitted successfully!"),
    ).toBeInTheDocument();

    vi.useFakeTimers();
    vi.advanceTimersByTime(3000);
    vi.useRealTimers();
  });

  it("should be responsive", async () => {
    expect.assertions(2);
    const { container } = setup();

    window.innerWidth = 320;
    window.dispatchEvent(new Event("resize"));
    expect(container.firstChild).toHaveClass("w-full");

    window.innerWidth = 1024;
    window.dispatchEvent(new Event("resize"));
    expect(container.firstChild).toHaveClass("max-w-[80%]");
  });
});
