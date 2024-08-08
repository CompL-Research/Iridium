# Playground

This is meant to be a simple visualizer that helps in debugging and so.

### socket events

1. `connection`: Gives a socket when a Playground Client connects.

2. `disconnect`: Invoken when a Playground Client disconnects.

3. `get-log-listing`: Request sent by client to read the logs.

get-log-listing(dataLen : number)

LastDataLength = length of the logs that the client has

if LastDataLength === LocalLogsLength: do nothing

else send remaining logs

4. 