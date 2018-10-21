/**
 * - create a peer connection.
 * - create offer description (uses stun to get network information)
 * - set description as local descrition
 * - send to remote peer via some means
 * - peer sets the remote description, creates an answer description, sets that as the local description
 * - recieve the answer and set that as the remote description
 *
 * somewhere in there
 * - get an ice candidate, send it to the remove and set it as the ice candidate.
 */

import * as React from "react"
import * as signalhub from "signalhub"
import { O_CREAT } from "constants"
import { getHeapStatistics } from "v8"

interface HandshakeOfferMessage {
	fromId: string
	type: "offer"
	desc: RTCSessionDescriptionInit
}

interface HandshakeIceMessage {
	fromId: string
	type: "ice"
	candidate: RTCIceCandidate
}

type HandshakeMessage = HandshakeOfferMessage | HandshakeIceMessage

// Example of all the overhead logic.
// https://webrtc.github.io/samples/src/content/peerconnection/pc1/
class Communication {
	private hub: any
	public myId: string
	public myContacts: Array<string>
	public myConnections: {
		[contactId: string]: {
			conn: RTCPeerConnection
			sendChannel: RTCDataChannel
		}
	}

	constructor() {
		// Connect to the signalhub.
		this.hub = signalhub("simple-webrtc-example", ["http://localhost:8081"])

		// Load the user id from disk.
		let myId = localStorage.getItem("myId")
		if (myId === null) {
			myId = (Math.random() * 1e10).toString().slice(0, 10)
			localStorage.setItem("myId", myId)
		}
		this.myId = myId

		// Load contacts from disk.
		let myContacts = []
		try {
			const existingContacts = localStorage.getItem("myContacts")
			if (existingContacts) {
				myContacts = JSON.parse(existingContacts)
			}
		} catch (error) {}
		this.myContacts = myContacts

		// Listen for webrtc peer connnection description handshake on my channel for
		// other users to connect when the come online.
		this.hub.subscribe(this.myId).on("data", this.handleHandeshakeMessage)

		// Broadcast webrtc peer connnection description handshake on all my contacts
		// channels to establish a connection.
		myContacts.map(this.initiateConnection)
	}

	private addContact = (contactId: string) => {
		this.myContacts = [...this.myContacts, contactId]
		const existingContacts = localStorage.setItem(
			"myContacts",
			JSON.stringify(this.myContacts)
		)
		this.initiateConnection(contactId)
	}

	private initiateConnection = async (contactId: string) => {
		// Create a peer connection.
		const pc = new RTCPeerConnection({
			iceServers: [{ urls: "stuns:stun.l.google.com:19302" }],
		})

		pc.onicecandidate = event => {
			if (event.candidate) {
				this.sendHandshakeIceMessage(contactId, event.candidate)
			}
		}

		pc.ondatachannel = function(event) {
			const receiveChannel = event.channel
			receiveChannel.onmessage = function(event) {
				// TODO: do something with this data.
				console.log(event.data)
			}
		}

		const sendChannel = pc.createDataChannel("sendDataChannel")
		this.myConnections[contactId] = {
			conn: pc,
			sendChannel,
		}

		// Use google's stun server to figure out network stuff.
		const description = await pc.createOffer()
		// Set the network config.
		pc.setLocalDescription(description)
		// Broadcast network config to friend.
		this.sendHandshakeOfferMessage(contactId, description)
	}

	private handleHandeshakeMessage = async (message: HandshakeMessage) => {
		const { fromId } = message
		if (!this.myConnections[fromId]) {
			// TODO: add to contacts?
			console.log("Not a contact...")
			return
		}
		const pc = this.myConnections[fromId].conn
		if (message.type === "offer") {
			const { desc } = message
			if (desc.type === "offer") {
				await pc.setRemoteDescription(desc)
				const description = await pc.createAnswer()
				await pc.setLocalDescription(description)
				// Broadcast network config to friend.
				this.sendHandshakeOfferMessage(fromId, description)
				return
			}

			if (desc.type === "answer") {
				await pc.setRemoteDescription(desc)
				return
			}
		}
		if (message.type === "ice") {
			pc.addIceCandidate(message.candidate)
		}
	}

	private sendHandshakeOfferMessage(
		toId: string,
		desc: RTCSessionDescriptionInit
	) {
		// TODO: encrypt this and use a signature!
		const message: HandshakeMessage = {
			fromId: this.myId,
			type: "offer",
			desc: desc,
		}
		this.hub.broadcast(toId, message)
	}

	private sendHandshakeIceMessage(toId: string, candidate: RTCIceCandidate) {
		// TODO: encrypt this and use a signature!
		const message: HandshakeMessage = {
			fromId: this.myId,
			type: "ice",
			candidate: candidate,
		}
		this.hub.broadcast(toId, message)
	}
}

class App extends React.Component {
	private comm = new Communication()

	public render() {
		return (
			<div className="App">
				<div>myId: {this.comm.myId}</div>

				<header className="App-header">
					<h1 className="App-title">Welcome to React</h1>
				</header>
				<p className="App-intro">
					To get started, edit <code>src/App.tsx</code> and save to reload.
				</p>
			</div>
		)
	}
}

export default App
