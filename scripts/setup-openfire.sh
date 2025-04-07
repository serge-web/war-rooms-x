#!/bin/bash

# Script to set up OpenFire for testing

# Build and start the OpenFire container
echo "Building and starting OpenFire container..."
docker-compose up -d openfire

# Wait for OpenFire to start up
echo "Waiting for OpenFire to start up (this may take a minute)..."
for i in {1..30}; do
  if curl -s http://localhost:9090 > /dev/null; then
    echo "OpenFire is up and running!"
    break
  fi
  
  if [ $i -eq 30 ]; then
    echo "Timed out waiting for OpenFire to start"
    exit 1
  fi
  
  echo "Waiting for OpenFire to start... ($i/30)"
  sleep 2
done

echo "OpenFire is now running and available at:"
echo "Admin Console: http://localhost:9090"
echo "XMPP WebSocket: ws://localhost:7070/ws"
echo ""
echo "You will need to complete the initial setup by visiting the Admin Console."
echo "Use the following settings:"
echo "- Language: English"
echo "- Server Settings: Default"
echo "- Database: Embedded Database"
echo "- Profile: Default"
echo "- Admin Account: Use the credentials from your config/openfire.json file"
echo ""
echo "After setup, make sure to enable the following in the Admin Console:"
echo "- Server > Server Settings > HTTP Binding (BOSH): Enabled on port 7070"
echo "- Server > Server Features > REST API: Enabled"
echo "- Server > Server Features > PubSub: Enabled"
echo "- Server > Group Chat > MUC: Enabled"
