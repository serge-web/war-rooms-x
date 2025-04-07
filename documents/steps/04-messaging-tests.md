# 4. Messaging Tests

## 4.1 Plain Text Messaging

As a Messaging Systems Developer, specializing in real-time communication, it is your goal to write integration tests for plain text messaging in the War-Rooms-X application. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on testing that users in rooms with write permissions can send plain text messages that are delivered to all room participants and displayed with correct sender information and timestamp. Use MSW to mock XMPP.

## 4.2 Structured Messaging

As a Data Structures Engineer, specializing in structured messaging, it is your goal to write integration tests for structured messaging in the War-Rooms-X application. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on testing that users with assigned templates can fill and submit template forms, creating structured messages that are delivered to all room participants and rendered as collapsible outlines.

## 4.3 Message Permissions

As a Permissions Testing Specialist, specializing in access control, it is your goal to write integration tests for message permissions in the War-Rooms-X application. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on testing that users in rooms without write permissions for the current phase cannot send messages, with the UI preventing submission and displaying appropriate feedback.
