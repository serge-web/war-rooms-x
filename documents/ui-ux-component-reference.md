War-Rooms-X: UX/UI Component Reference

This document outlines the reusable UI components for War-Rooms-X, including their expected behavior, props, and usage patterns. The components are built to maintain consistency across different parts of the application, ensuring that players, game control, and admins have a seamless experience.

⸻

🧩 Components Overview

Components in War-Rooms-X are designed to be modular, reusable, and customizable. They are built using ReactJS and styled with TailwindCSS. Shared UI components like buttons, message bubbles, and input forms are described here, along with their props and behaviors.

⸻

📱 General Layout Components

1. Room Tabs
	•	Description: Displays each room as a clickable tab at the top of the room panel.
	•	Behavior:
	•	Click to open the corresponding room.
	•	Display an “info” icon (i) on rooms with available metadata.
	•	Show an active state when selected.
	•	Props:
	•	roomName: The name of the room.
	•	isActive: Boolean to indicate if this tab is currently active.
	•	onClick: Function to trigger when the tab is clicked.

Example:
```jsx
<RoomTab
  roomName="blue_chat"
  isActive={true}
  onClick={() => handleRoomClick("blue_chat")}
/>
```

2. Message Bubble
	•	Description: Displays each message within a room, showing the sender, timestamp, and content.
	•	Behavior:
	•	Differentiate between plain text and structured messages.
	•	Render structured messages as an outline list.
	•	Show the sender’s role and force next to their name.
	•	Apply styling based on message type (e.g., colors for different forces).
	•	Props:
	•	message: The full message object (including sender, timestamp, content, type).
	•	isSender: Boolean to indicate if the current user sent the message.
	•	messageType: Type of message (plain, structured).
	•	roleColor: Color for the sender’s role (e.g., Blue, Red).

Example:
```jsx
<MessageBubble 
  message={message} 
  isSender={true} 
  messageType="structured" 
  roleColor="#1e3a8a"
/>
```

🧑‍🤝‍🧑 User Interaction Components

3. Message Input Form
	•	Description: A form to submit messages within a room. The form is dynamically configured based on whether the message is plain or structured.
	•	Behavior:
	•	The form should render the appropriate input field (text input for plain chat or dynamic form for structured messages).
	•	When a message is submitted, the handleMessageSubmit function (retrieved via useRoom) will handle sending the message.
	•	The room context (e.g., active room) is also automatically retrieved from the useRoom hook, so it’s unnecessary to pass the room and the submit handler as props.
	•	Props:
	•	None (the useRoom hook will internally handle room and submit logic)
	•	Example:
```jsx
function MessageInputForm() {
  const { room, handleMessageSubmit } = useRoom(); // Automatically retrieve room context
  const [message, setMessage] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    handleMessageSubmit(message);
    setMessage(''); // Reset input after submission
  };

  return (
    <form onSubmit={onSubmit} className="message-input-form">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={`Type a message in ${room}`}
        className="message-input"
      />
      <button type="submit" className="send-button">Send</button>
    </form>
  );
}
```

4. Template Form
	•	Description: Displays the structured form for sending template-based messages.
	•	Behavior:
	•	Uses RJSF (React JSON Schema Form) to dynamically render a form based on the template schema.
	•	Allows players to fill out the form and submit the structured message.
	•	If a template is not assigned, fall back to the plain message form.
	•	Props:
	•	template: JSON schema of the selected template.
	•	onSubmit: Function to handle submission of the structured message.
	•	phase: Current game phase to enforce template availability.

Example:
```jsx
<TemplateForm 
  template={selectedTemplate} 
  onSubmit={handleTemplateSubmit} 
  phase="Planning" 
/>
```

🔧 Utility Components

5. Button
	•	Description: A reusable button component with support for different styles (primary, secondary, etc.).
	•	Behavior:
	•	Triggers a custom onClick function.
	•	Can be styled differently based on the type of action (e.g., submit, cancel).
	•	Props:
	•	label: Button text.
	•	onClick: Function triggered on button click.
	•	type: Button type (primary, secondary, danger).
	•	disabled: Boolean to disable the button.

Example:
```jsx
<Button 
  label="Send" 
  onClick={handleSendMessage} 
  type="primary" 
  disabled={isDisabled} 
/>
```

6. Modal
	•	Description: A modal window that can display various types of content (e.g., message history, system logs).
	•	Behavior:
	•	Opened when triggered by a specific action (e.g., “View System Log”).
	•	Can be closed by clicking the “Close” button or clicking outside the modal.
	•	Props:
	•	isOpen: Boolean to control the modal’s visibility.
	•	content: The content to be rendered inside the modal.
	•	onClose: Function to handle modal close action.

Example:
```jsx
<Modal 
  isOpen={isModalOpen} 
  content={logContent} 
  onClose={closeModal} 
/>
```

7. Player Banner
	•	Description: A small banner that displays the current player’s identity (name, role, force, and icon).
	•	Behavior:
	•	Shows player’s role and force.
	•	Displays an icon to visually represent the player.
	•	Props:
	•	playerName: Name of the player.
	•	playerRole: Role of the player.
	•	playerForce: Force to which the player belongs.
	•	playerIcon: Icon representing the player.

Example:
```jsx
<PlayerBanner 
  playerName="Blue CO" 
  playerRole="CO" 
  playerForce="Blue" 
  playerIcon="blue_icon.png"
/>
```

🎨 Styling Guidelines

All components should follow the design principles outlined in the wargame theme. This includes:
	1.	Color Palette:
	•	Primary: Blue (#1e3a8a)
	•	Secondary: Green (#22c55e)
	•	Background: Light Gray (#f3f4f6)
	2.	Typography:
	•	Heading fonts: "Roboto", sans-serif
	•	Body text fonts: "Arial", sans-serif
	3.	Spacing:
	•	Consistent margins and paddings between components (use TailwindCSS spacing classes: m-4, p-2, etc.).

⸻

📝 Future Enhancements
	1.	Add advanced components like a game timeline or turn history.
	2.	Internationalization (i18n): Add support for multiple languages by creating localized components.
	3.	Accessibility improvements: Ensure components are keyboard-navigable and screen-reader friendly.

