import 'package:uuid/uuid.dart';

class Reminder {
  final String id;
  final String description;
  final String time;
  final DateTime createdAt;

  Reminder({
    required this.id,
    required this.description,
    required this.time,
    required this.createdAt,
  });
}

class ReminderService {
  final List<Reminder> _reminders = [];
  final _uuid = const Uuid();

  List<Reminder> get reminders => List.unmodifiable(_reminders);

  String addReminder(String description, String time) {
    final reminder = Reminder(
      id: _uuid.v4(),
      description: description,
      time: time,
      createdAt: DateTime.now(),
    );
    _reminders.add(reminder);
    return 'Success: Reminder set for "$description" at $time.';
  }
}
