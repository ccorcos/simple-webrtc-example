# Simple WebRTC Example

This is a simple, yet fully functional, example of a WebRTC chat application.

It uses [signalhub](https://github.com/mafintosh/signalhub) to route public messages for handshaking, and it uses Google's STUN server for determining network routing stuff.

The [examples from Google](https://webrtc.github.io/samples/) were helpful for building this. However, they do not handle signalling through a public channel.

```
npm install
npm run signalhub # first terminal window
npm start # second terminal window
```




