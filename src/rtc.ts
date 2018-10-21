import * as signalhub from "signalhub"

// Centralized router for handshaking.
const hub = signalhub("simple-webrtc-example", ["http://localhost:8081"])

interface OfferMessage {
	type: "offer"
	fromId: string
	description: RTCSessionDescriptionInit
}

interface AnswerMessage {
	type: "answer"
	fromId: string
	description: RTCSessionDescriptionInit
}

interface IceCandidateMessage {
	type: "ice"
	fromId: string
	candidate: RTCIceCandidate
}

type PublicMessage = OfferMessage | AnswerMessage | IceCandidateMessage

class RTCRemoteManager {
	public id: string
	private local: RTCLocalManager
	private connection: RTCPeerConnection
	private sendChannel: RTCDataChannel

	constructor(id: string, manager: RTCLocalManager) {
		this.id = id
		this.local = manager

		// Create a peer connection.
		this.connection = new RTCPeerConnection({
			iceServers: [{ urls: "stuns:stun.l.google.com:19302" }],
		})

		// Send ICE candidate to the other peer to set up the connection channel.
		this.connection.addEventListener("icecandidate", event => {
			if (event.candidate) {
				this.local.sendPublicMessage(this.id, {
					fromId: this.local.id,
					type: "ice",
					candidate: event.candidate,
				})
			}
		})

		// Listen for data on the data channel.
		this.connection.addEventListener("datachannel", event => {
			const receiveChannel = event.channel
			receiveChannel.addEventListener("message", event => {
				const listeners = Array.from(this.listeners)
				for (const listener of listeners) {
					listener(JSON.parse(event.data))
				}
			})
		})

		// Create the send data channel.
		this.sendChannel = this.connection.createDataChannel("sendDataChannel")
	}

	private listeners = new Set<(data: any) => void>()
	public addListener(fn: (data: any) => void) {
		this.listeners.add(fn)
	}
	public removeListener(fn: (data: any) => void) {
		this.listeners.delete(fn)
	}

	public send(data: any) {
		this.sendChannel.send(JSON.stringify(data))
	}

	public async initiate() {
		// Use google's stun server to figure out network stuff.
		const description = await this.connection.createOffer()
		this.connection.setLocalDescription(description)
		// Broadcast network config to the peer.
		this.local.sendPublicMessage(this.id, {
			fromId: this.local.id,
			type: "offer",
			description: description,
		})
	}

	public async recieveOfferMessage(message: OfferMessage) {
		// Set the remove description of the offer
		await this.connection.setRemoteDescription(message.description)
		// Respond with an answer.
		const description = await this.connection.createAnswer()
		await this.connection.setLocalDescription(description)
		this.local.sendPublicMessage(message.fromId, {
			fromId: this.local.id,
			type: "answer",
			description: description,
		})
	}

	public async receiveAnswerMessage(message: AnswerMessage) {
		await this.connection.setRemoteDescription(message.description)
	}

	public async receiveIceCandidateMessage(message: IceCandidateMessage) {
		await this.connection.addIceCandidate(message.candidate)
	}
}

export class RTCLocalManager {
	// Initialize with the id of this client.
	constructor(public id: string) {
		// Listen for public messages.
		hub.subscribe(id).on("data", this.receivePublicMessage)
	}

	private connections: { [toId: string]: RTCRemoteManager } = {}

	public connect(toId: string) {
		const remote = new RTCRemoteManager(toId, this)
		this.connections[toId] = remote
		return remote
	}

	public sendPublicMessage = (toId: string, message: PublicMessage) => {
		hub.broadcast(toId, message)
	}

	public receivePublicMessage = (message: PublicMessage) => {
		const remote = this.connections[message.fromId]
		if (remote) {
			if (message.type === "offer") {
				remote.recieveOfferMessage(message)
			} else if (message.type === "answer") {
				remote.receiveAnswerMessage(message)
			} else {
				remote.receiveIceCandidateMessage(message)
			}
		}
	}
}
