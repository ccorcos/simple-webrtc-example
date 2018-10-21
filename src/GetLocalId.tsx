import * as React from "react"
import GetRemoteId from "./GetRemoteId"

interface GetLocalIdState {
	inputValue: string
	localId: string | undefined
}

class GetLocalId extends React.Component<{}, GetLocalIdState> {
	state: GetLocalIdState = {
		inputValue: "",
		localId: undefined,
	}

	private handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({ inputValue: e.target.value })
	}

	private handleLocalIdInputKeyPress = (
		event: React.KeyboardEvent<HTMLInputElement>
	) => {
		if (event.key === "Enter") {
			this.setState({ inputValue: "", localId: this.state.inputValue })
		}
	}

	public render() {
		if (!this.state.localId) {
			return (
				<div>
					<input
						type="text"
						placeholder="Make an id for yourself..."
						value={this.state.inputValue}
						onChange={this.handleInputChange}
						onKeyPress={this.handleLocalIdInputKeyPress}
					/>
				</div>
			)
		}
		return <GetRemoteId localId={this.state.localId} />
	}
}

export default GetLocalId
