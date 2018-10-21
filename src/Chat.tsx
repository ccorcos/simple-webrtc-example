import * as React from "react"
import { RTCLocalManager, RTCRemoteManager } from "./rtc"

interface ChatProps {
	localId: string
	remoteId: string
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
		const local = new RTCLocalManager(this.props.localId)
		this.remote = local.connect(this.props.remoteId)
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
