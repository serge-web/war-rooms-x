FROM openjdk:11-jre-slim

# Set environment variables
ENV OPENFIRE_VERSION=4.7.5
ENV OPENFIRE_USER=openfire
ENV OPENFIRE_DATA_DIR=/var/lib/openfire
ENV OPENFIRE_LOG_DIR=/var/log/openfire

# Create user and directories
RUN useradd -ms /bin/bash ${OPENFIRE_USER} && \
    mkdir -p ${OPENFIRE_DATA_DIR} ${OPENFIRE_LOG_DIR} && \
    chown -R ${OPENFIRE_USER}:${OPENFIRE_USER} ${OPENFIRE_DATA_DIR} ${OPENFIRE_LOG_DIR}

# Install required packages
RUN apt-get update && \
    apt-get install -y wget && \
    rm -rf /var/lib/apt/lists/*

# Download and install OpenFire
RUN wget -O /tmp/openfire.tar.gz https://github.com/igniterealtime/Openfire/releases/download/v${OPENFIRE_VERSION}/openfire_${OPENFIRE_VERSION}_all.tar.gz && \
    tar -xzf /tmp/openfire.tar.gz -C /opt && \
    rm /tmp/openfire.tar.gz && \
    chown -R ${OPENFIRE_USER}:${OPENFIRE_USER} /opt/openfire

# Copy custom configuration if needed
# COPY openfire.xml /opt/openfire/conf/openfire.xml

# Expose ports
# 9090: Admin Console
# 5222: XMPP Client Connection
# 7070: XMPP HTTP Binding (BOSH)
# 7443: XMPP HTTPS Binding
# 5269: XMPP Server-to-Server
EXPOSE 9090 5222 7070 7443 5269

# Switch to openfire user
USER ${OPENFIRE_USER}

# Set working directory
WORKDIR /opt/openfire

# Start OpenFire
CMD ["/opt/openfire/bin/openfire", "run"]
