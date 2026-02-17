import 'package:flutter/foundation.dart';
import 'package:google_generative_ai/google_generative_ai.dart';
import 'package:uuid/uuid.dart';
import '../models/message.dart';
import '../services/reminder_service.dart';

// Your API Key
const String _kApiKey = 'AIzaSyClKHITo656hEzJhS-EHTqChp55ImmRLnQ';

class ChatProvider extends ChangeNotifier {
  final ReminderService _reminderService;
  final List<Message> _messages = [];
  late final GenerativeModel _model;
  late final ChatSession _chat;

  ChatProvider(this._reminderService) {
    _initModel();
  }

  List<Message> get messages => List.unmodifiable(_messages);
  bool _isLoading = false;
  bool get isLoading => _isLoading;

  // lib/providers/chat_provider.dart
  void _initModel() {
    // 1. Correct Schema Syntax
    final setReminderTool = FunctionDeclaration(
      'setReminder',
      'Saves a reminder for the user with a description and time.',
      Schema.object(
        properties: {
          'description': Schema.string(description: 'Task description'),
          'time': Schema.string(description: 'Time for the reminder'),
        },
        // Fixed: 'requiredProperties' is the correct parameter name
        requiredProperties: ['description', 'time'],
      ),
    );

    // 2. Updated Model Name
    _model = GenerativeModel(
      model: 'gemini-2.5-flash', // Use stable 2.5 flash to avoid 404
      apiKey: _kApiKey,
      tools: [
        Tool(functionDeclarations: [setReminderTool])
      ],
    );

    _chat = _model.startChat();
  }

  Future<void> sendMessage(String text) async {
    if (text.trim().isEmpty) return;

    final userMessage = Message(
      id: const Uuid().v4(),
      text: text,
      isUser: true,
      timestamp: DateTime.now(),
    );

    _messages.add(userMessage);
    _isLoading = true;
    notifyListeners();

    try {
      // 3. Send message and handle the Agentic Loop
      var response = await _chat.sendMessage(Content.text(text));

      // Check if the AI decided to call your 'setReminder' tool
      final functionCalls = response.functionCalls.toList();

      if (functionCalls.isNotEmpty) {
        for (final call in functionCalls) {
          if (call.name == 'setReminder') {
            final description = call.args['description'] as String;
            final time = call.args['time'] as String;

            // Execute the actual Flutter service code
            final result = _reminderService.addReminder(description, time);

            // Send tool result back to Gemini so it can give a friendly reply
            response = await _chat.sendMessage(
              Content.functionResponse(call.name, {'result': result}),
            );
          }
        }
      }

      if (response.text != null) {
        _messages.add(Message(
          id: const Uuid().v4(),
          text: response.text!,
          isUser: false,
          timestamp: DateTime.now(),
        ));
      }
    } catch (e) {
      _messages.add(Message(
        id: const Uuid().v4(),
        text: 'Error: ${e.toString()}',
        isUser: false,
        timestamp: DateTime.now(),
      ));
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
