import * as React from "react"
import { RTCLocalManager, RTCRemoteManager, OfferMessage } from "./rtc"

interface ChatProps {
	local: RTCLocalManager
	initiateRemoteId?: string | undefined
	repondToOffer?: OfferMessage | undefined
}

interface ChatState {
	inputValue: string
	messages: Array<string>
}

interface Message {
	value: string
}

class Chat extends React.Component<ChatProps, ChatState> {
	state: ChatState = {
		inputValue: "",
		messages: [],
	}

	private remote: RTCRemoteManager

	constructor(props: ChatProps) {
		super(props)
		if (this.props.initiateRemoteId) {
			this.remote = this.props.local.connect(this.props.initiateRemoteId)
			this.remote.initiate()
		} else if (this.props.repondToOffer) {
			this.remote = this.props.local.connect(this.props.repondToOffer.fromId)
			this.remote.recieveOfferMessage(this.props.repondToOffer)
		}
		this.remote.addListener(this.handleMessage)
	}

	private handleMessage = (message: Message) => {
		this.setState({
			messages: [...this.state.messages, message.value],
		})
	}

	private sendMessage = (message: Message) => {
		this.handleMessage(message)
		this.remote.send(message)
	}

	private handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({ inputValue: e.target.value })
	}

	private handleInputKeyPress = (
		event: React.KeyboardEvent<HTMLInputElement>
	) => {
		if (event.key === "Enter") {
			this.sendMessage({ value: this.state.inputValue })
			this.setState({ inputValue: "" })
		}
	}
	public render() {
		return (
			<div>
				<div>
					{this.state.messages.map((str, idx) => (
						<div key={idx}>{str}</div>
					))}
				</div>
				<hr />
				<input
					type="text"
					placeholder="Say something..."
					value={this.state.inputValue}
					onChange={this.handleInputChange}
					onKeyPress={this.handleInputKeyPress}
				/>
			</div>
		)
	}
}

export default Chat
