# 📘 XMPP PubSub Discovery and Reading using stanza.io

This document outlines the sequence of operations an XMPP client using `stanza.io` must perform to discover a PubSub service, list visible nodes, and retrieve items (documents).

A lower section covers [subscribing to nodes for real-time updates](#-subscribing-to-xmpp-pubsub-nodes-using-stanzaio).

Another lower section covers [managing collections](#-managing-xmpp-pubsub-collections-with-stanzaio).

---

## 🧭 Overview

1. Connect to the XMPP server.
2. Discover PubSub service via service discovery.
3. Discover PubSub capabilities.
4. List visible PubSub nodes.
5. Optionally inspect a node's metadata.
6. Retrieve items from a specific node.

---

## 📘 Mermaid Sequence Diagram

```mermaid
sequenceDiagram
    participant Client as stanza.io Client
    participant Server as XMPP Server
    participant PubSub as PubSub Service

    Client->>Server: disco#items (to domain)
    Server-->>Client: JIDs of services (includes pubsub.domain)

    Client->>PubSub: disco#info
    PubSub-->>Client: Service features (e.g. pubsub#retrieve-items)

    Client->>PubSub: disco#items
    PubSub-->>Client: List of visible nodes

    Client->>PubSub: disco#info (node metadata) [optional]
    PubSub-->>Client: Node type, features

    Client->>PubSub: pubsub.items({ node })
    PubSub-->>Client: Items from the node
```

---

## 🛠️ stanza.io Code Concepts

| Step | stanza.io API |
|------|---------------|
| Connect | `client.connect()` |
| Disco#Items (domain) | `client.getDiscoItems(jid)` |
| Disco#Info (pubsub) | `client.getDiscoInfo(jid)` |
| Disco#Items (pubsub nodes) | `client.getDiscoItems(pubsubJid)` |
| Disco#Info (node metadata) | `client.getDiscoInfo(pubsubJid, node)` |
| Get node items | `client.getItems({ to: pubsubJid, node })` |

> Note: `pubsubJid` is typically something like `pubsub.domain.tld`.

---

## 🔐 Permissions

Ensure the PubSub nodes are configured with proper access model:
- `open` — anyone can subscribe
- `presence` — only contacts can
- `whitelist` or `authorize` — explicit permissions

This depends on the server-side (e.g., OpenFire) configuration.

---

## 📡 Subscribing to XMPP PubSub Nodes using stanza.io

This guide shows how to subscribe to updates from XMPP PubSub nodes using the `stanza.io` JavaScript library, receive real-time document updates, and unsubscribe when needed.

---

## 🔁 Subscription Flow (Mermaid Diagram)

```mermaid
sequenceDiagram
    participant Client as stanza.io Client
    participant PubSub as PubSub Service

    Client->>PubSub: subscribeToNode(pubsubJid, node)
    PubSub-->>Client: <iq type='result'/> (subscription confirmation)

    PubSub-->>Client: <message> with <pubsub:event> (item update)

    Client->>PubSub: unsubscribeFromNode(pubsubJid, node)
    PubSub-->>Client: <iq type='result'/> (unsubscription confirmation)
```

---

## 🛠️ Subscribing to a PubSub Node

Use `client.subscribeToNode()` to register for updates.

```js
client.subscribeToNode('pubsub.domain.tld', 'example/node');
```

This sends a `subscribe` request to the PubSub service. If the node is open or your JID is authorized, you’ll start receiving push updates.

---

## 📬 Receiving Updates

Listen for published items using:

```js
client.on('pubsub:event', msg => {
    const { node, items } = msg.pubsubEvent;
    console.log(`📥 New item(s) on node: ${node}`, items);
});
```

Example stanza received:

```xml
<message from='pubsub.domain.tld' to='client@domain/resource'>
  <event xmlns='http://jabber.org/protocol/pubsub#event'>
    <items node='example/node'>
      <item id='item123'>
        <entry xmlns='http://www.w3.org/2005/Atom'>
          <title>Update Title</title>
        </entry>
      </item>
    </items>
  </event>
</message>
```

---

## 🧹 Unsubscribing from a Node

Stop receiving updates with:

```js
client.unsubscribeFromNode('pubsub.domain.tld', 'example/node');
```

This sends an `unsubscribe` IQ stanza to the PubSub service, ending delivery of future events to your JID.

---

## 🧾 stanza.io API Summary

| Operation     | Method                                      |
|---------------|---------------------------------------------|
| Subscribe     | `client.subscribeToNode(pubsubJid, node)`   |
| Receive Items | `client.on('pubsub:event', callback)`       |
| Unsubscribe   | `client.unsubscribeFromNode(pubsubJid, node)`|

---

## ⚠️ Notes

- Subscriptions are **JID-specific**: each connected resource (device) must subscribe individually.
- Subscriptions may require approval depending on the **access model** of the node (`open`, `presence`, `authorize`, etc.).
- To persist subscriptions across sessions, ensure `persistent` subscriptions are supported/configured server-side.

# 🗂️ XMPP PubSub Collections (with stanza.io)

This document explains how to organize, create, and manage **PubSub Collection Nodes** using the XMPP PubSub specification ([XEP-0060](https://xmpp.org/extensions/xep-0060.html)) and interact with them using `stanza.io`.

Collection nodes act like folders or categories. They can contain **leaf nodes** (which store items) and other **collection nodes**, forming a hierarchical structure.

---

## 🧱 What is a Collection Node?

- A **Collection Node** does **not** hold published items directly.
- It **contains** other nodes: either **leaf** or **collections**.
- Subscribing to a collection node propagates events from its children (if supported by the server).

---

## 🔧 Creating a Collection Node

To create a collection node with stanza.io, use `client.createNode()` and pass `collection` config.

```js
client.createNode('pubsub.domain.tld', 'path/to/collection', {
  configure: true,
  form: {
    fields: [
      { name: 'pubsub#node_type', value: 'collection' }
    ]
  }
});
```

To make a leaf node a child of a collection node:

```js
client.createNode('pubsub.domain.tld', 'path/to/collection/my-leaf', {
  configure: true,
  form: {
    fields: [
      { name: 'pubsub#node_type', value: 'leaf' },
      { name: 'pubsub#collection', value: 'path/to/collection' }
    ]
  }
});
```

---

## 🔔 Subscribing to a Collection

Some servers (e.g., OpenFire) support **collection subscriptions**, which means:

```js
client.subscribeToNode('pubsub.domain.tld', 'path/to/collection');
```

If the server supports event propagation from child nodes, you will receive notifications from all contained leaf nodes.

---

## ✏️ Updating a Node’s Parent Collection

To move a node into a different collection:

```js
client.configureNode('pubsub.domain.tld', 'my-node', {
  fields: [
    { name: 'pubsub#collection', value: 'new/collection/path' }
  ]
});
```

> This requires `configure` permissions on the node.

---

## ❌ Deleting a Collection Node

To delete a collection node (and optionally its children):

```js
client.deleteNode('pubsub.domain.tld', 'path/to/collection');
```

> Not all servers support recursive deletion. You may need to delete children first.

---

## 📘 stanza.io Summary

| Operation | Method |
|----------|--------|
| Create Collection | `client.createNode(jid, node, config)` with `node_type=collection` |
| Create Leaf in Collection | `client.createNode(...)` with `pubsub#collection` field |
| Subscribe to Collection | `client.subscribeToNode(pubsubJid, collectionPath)` |
| Move Node | `client.configureNode(...)` with new `pubsub#collection` |
| Delete Node | `client.deleteNode(pubsubJid, node)` |

---

## ⚠️ Notes

- Node hierarchy is **virtual** — node names are not automatically namespaced like filesystems.
- Collection subscriptions may require server support (`pubsub#collection` and `deliver_payloads`).
- Server behavior varies! Always test with your specific server (e.g., OpenFire, Prosody, ejabberd).

---

Let me know if you’d like this turned into a live visual hierarchy using Mermaid or HTML.
