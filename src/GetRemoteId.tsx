import * as React from "react"
import Chat from "./Chat"
import { RTCLocalManager, OfferMessage } from "./rtc"

interface GetRemoteIdProps {
	localId: string
}

interface GetRemoteIdState {
	inputValue: string
	remoteId: string | undefined
	offer: OfferMessage | undefined
}

class GetRemoteId extends React.Component<GetRemoteIdProps, GetRemoteIdState> {
	state: GetRemoteIdState = {
		inputValue: "",
		remoteId: undefined,
		offer: undefined,
	}

	private local: RTCLocalManager
	constructor(props: GetRemoteIdProps) {
		super(props)
		this.local = new RTCLocalManager(this.props.localId)
		this.local.addListener(this.handleRemoteOffer)
	}

	componentWillUnmount() {
		this.local.removeListener(this.handleRemoteOffer)
	}

	private handleRemoteOffer = (message: OfferMessage) => {
		this.setState({ offer: message })
	}

	private handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({ inputValue: e.target.value })
	}

	private handleRemoteIdInputKeyPress = (
		event: React.KeyboardEvent<HTMLInputElement>
	) => {
		if (event.key === "Enter") {
			this.setState({ inputValue: "", remoteId: this.state.inputValue })
		}
	}

	public render() {
		if (this.state.offer) {
			return <Chat repondToOffer={this.state.offer} local={this.local} />
		}
		if (this.state.remoteId) {
			return <Chat initiateRemoteId={this.state.remoteId} local={this.local} />
		}
		return (
			<div>
				<input
					type="text"
					placeholder="Who do you want to talk to..."
					value={this.state.inputValue}
					onChange={this.handleInputChange}
					onKeyPress={this.handleRemoteIdInputKeyPress}
				/>
			</div>
		)
	}
}

export default GetRemoteId
