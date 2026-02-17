# Flutter Gemini Agentic App

## Overview
This is a cross-platform Flutter application that demonstrates an agentic AI architecture using the Gemini API. The app features a chat interface where the AI can autonomously decide to use a 'setReminder' tool based on user input.

## Architecture
The application follows a clean architecture pattern:
- **Presentation Layer**: UI components using Material 3 design principles.
- **State Management**: Uses `Provider` to manage application state and business logic.
- **Service Layer**: 
    - `ChatProvider`: Handles communication with Gemini API and manages the agentic loop.
    - `ReminderService`: Handles local storage of reminders.

### Agentic Loop
The core intelligence resides in `ChatProvider`. The agent is initialized with a system instruction and a set of tools (functions). 
1. **User Input**: The user sends a message.
2. **Model Processing**: The Gemini model processes the message and decides if it needs to call a tool (e.g., `setReminder`).
3. **Tool Execution**: If a tool call is requested, the app executes the corresponding function.
4. **Response Generation**: The result of the tool execution is fed back to the model, which then generates a natural language response.

## Setup
1. **Prerequisites**: Ensure you have Flutter SDK installed.
2. **Key Setup**: usage of the API key is handled securely (Replace `YOUR_API_KEY` in `lib/providers/chat_provider.dart` or use `--dart-define`).
3. **Run**:
    ```bash
    flutter pub get
    flutter run
    ```
