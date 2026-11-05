"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";

type ChatMessage = {
  question: string;
  answer: string;
};

const starterQuestions = [
  "How do I get a Kenyan passport?",
  "What services are available at Huduma Centres?",
  "Who is my Member of Parliament?",
];

export default function GovernmentChat() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  function askQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = question.trim();
    if (!value) return;

    setMessages((current) => [
      ...current,
      {
        question: value,
        answer:
          "This preview will connect you to verified Kenyan government sources. For now, try one of the example questions or browse the official service directory.",
      },
    ]);
    setQuestion("");
  }

  return (
    <section className="government-chat" aria-labelledby="government-chat-title">
      <div className="government-chat__intro">
        <p className="government-chat__eyebrow">Ask CitizenGuide</p>
        <h2 id="government-chat-title" className="government-chat__title">
          What do you need help with?
        </h2>
        <p className="government-chat__lead">
          Ask in your own words. Get a clear answer linked to official Kenyan government sources.
        </p>
      </div>

      <form className="government-chat__form" onSubmit={askQuestion} aria-label="Ask CitizenGuide a question">
        <label className="govuk-visually-hidden" htmlFor="government-question">
          Ask a question about Kenyan government
        </label>
        <textarea
          id="government-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="For example: How do I register a business?"
          rows={2}
        />
        <div className="government-chat__form-actions">
          <span className="government-chat__privacy">No account needed to start</span>
          <button className="govuk-button" type="submit" disabled={!question.trim()}>
            Ask CitizenGuide
            <span aria-hidden="true"> →</span>
          </button>
        </div>
      </form>

      <div className="government-chat__examples" aria-label="Example questions">
        <span className="government-chat__examples-label">Try asking:</span>
        {starterQuestions.map((item) => (
          <button key={item} type="button" onClick={() => setQuestion(item)}>
            {item}
          </button>
        ))}
      </div>

      {messages.length > 0 && (
        <div className="government-chat__conversation" aria-live="polite">
          {messages.map((message, index) => (
            <div className="government-chat__turn" key={`${message.question}-${index}`}>
              <p className="government-chat__question">{message.question}</p>
              <div className="government-chat__answer">
                <p>{message.answer}</p>
                <p className="government-chat__sources">
                  <strong>Sources:</strong>{" "}
                  <Link href="/services">Browse verified government services</Link>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="government-chat__disclaimer">
        CitizenGuide brings public information together. Always confirm important details with the linked government institution.
      </p>
    </section>
  );
}
