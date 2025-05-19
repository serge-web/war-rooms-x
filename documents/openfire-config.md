These are the steps to installing and configuring Openfire for this app.

1. Install
2. Run startup from localhost:7070, note: (embedded database)
    a. Provide host name/IP for both domain names
    b. Relax admin console access
    c. Embedded database
    d. Default profile settings
    e. Provide admin email address
3. Install plugins
    a. REST API
4. Configure REST (Server / Server Settings / REST API)
    a. Enable REST
    b. Specify HTTP basic auth (note: Swagger UI requires pass-phrase, not user/pwd)
    c. Enable additional logging
    d. Relax wildcards (adminConsole.access.allow-wildcards-in-excludes: true)[1]
5. Configure MUC
    a. Group Chat / Group Chat Settings / History : Show Entire Chat History
    b. Default Room Settings: Make Room Persistent
    c. Group Chat / Group Chat Settings / Memory Management - disable MUC room unloading
    d. Server Settings > Message Audit Policy > Enable Auditing
    e. Plugins - install Monitoring. Then Server > Archiving > Archive Group Chats 

Install OpenFire on Digital Ocean according to the article here:
https://www.digitalocean.com/community/tutorials/how-to-install-openfire-xmpp-server-on-a-debian-or-ubuntu-vps

This is the command to restart OpenFire on Digital Ocean:
`sudo /etc/init.d/openfire stop`

 [1] According to article here: https://discourse.igniterealtime.org/t/when-i-upload-to-4-7-5-the-restapi-always-redirect/92892/2   

 



    