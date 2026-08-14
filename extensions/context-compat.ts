export type ContextMessageMarker = Readonly<{
  type?: string;
  role?: string;
  customType?: string;
}>;

type CompatibleSessionManager = {
  buildSessionContext?: () => { messages: readonly ContextMessageMarker[] };
  buildContextEntries?: () => readonly ContextMessageMarker[];
};

export function contextMessages(
  sessionManager: unknown,
): readonly ContextMessageMarker[] {
  if (sessionManager === null || typeof sessionManager !== "object") {
    throw new Error("Unsupported session manager: expected an object");
  }

  const compatible = sessionManager as CompatibleSessionManager;

  if (typeof compatible.buildSessionContext === "function") {
    const messages = compatible.buildSessionContext().messages;
    if (!Array.isArray(messages)) {
      throw new Error(
        "Unsupported session manager: buildSessionContext() returned no messages array",
      );
    }
    return messages;
  }

  if (typeof compatible.buildContextEntries === "function") {
    const entries = compatible.buildContextEntries();
    if (!Array.isArray(entries)) {
      throw new Error(
        "Unsupported session manager: buildContextEntries() returned no entries array",
      );
    }
    return entries;
  }

  throw new Error(
    "Unsupported session manager: expected buildSessionContext() or buildContextEntries()",
  );
}

export function latestMarkerIsActive(
  messages: readonly ContextMessageMarker[],
  activeType: string,
  disabledType: string,
): boolean {
  let active = false;

  for (const message of messages) {
    if (message.role !== "custom" && message.type !== "custom_message") {
      continue;
    }

    if (message.customType === activeType) {
      active = true;
    } else if (message.customType === disabledType) {
      active = false;
    }
  }

  return active;
}
