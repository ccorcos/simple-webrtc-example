// pc = new RTCPeerConnection(null);
// pc.onaddstream = gotRemoteStream;
// pc.addStream(localStream);
// pc.createOffer(gotOffer);

// ,

// function gotOffer(desc) {
//   pc.setLocalDescription(desc);
//   sendOffer(desc);
// }

// function gotAnswer(desc) {
//   pc.setRemoteDescription(desc);
// }

// function gotRemoteStream(e) {
//   attachMediaStream(remoteVideo, e.stream);
// }

// var pc = new webkitRTCPeerConnection(servers,
//   {optional: [{RtpDataChannels: true}]});

// pc.ondatachannel = function(event) {
//   receiveChannel = event.channel;
//   receiveChannel.onmessage = function(event){
//     document.querySelector("div#receive").innerHTML = event.data;
//   };
// };

// sendChannel = pc.createDataChannel("sendDataChannel", {reliable: false});

// document.querySelector("button#send").onclick = function (){
//   var data = document.querySelector("textarea#send").value;
//   sendChannel.send(data);
// };

// const args = [
// 	// { iceServers: [{ urls: "stuns:stun.l.google.com:19302" }] },
// 	// { optional: [{ RtpDataChannels: true }] },
// ] as any
// const pc = new RTCPeerConnection({
// 	iceServers: [{ urls: "stuns:stun.l.google.com:19302" }],
// })

// pc.ondatachannel = function(event) {
// 	const receiveChannel = event.channel
// 	receiveChannel.onmessage = function(event) {
// 		console.log(event.data)
// 	}
// }

// const sendChannel = pc.createDataChannel("sendDataChannel")
