For non channel/room related state, we will store this data as XMPP PubSub documents.

## Collection elements
- templates:  a list of game templates
- forces: more detail regarding the forces (~~taken from vCard.organisation~~ - no, since we can't change vCard of other users. Instead, we have pubsub doc for each user which contains this additional info)
- users: more detail on users, including title and force

## Leaf elements
- game-state to store current game state
- game-setup to store initial game config, including turn style and step times