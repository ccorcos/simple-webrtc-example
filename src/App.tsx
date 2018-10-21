import * as React from "react"
import Chat from "./Chat"

interface AppState {
	inputValue: string
	localId: string | undefined
	remoteId: string | undefined
}

class App extends React.Component<{}, AppState> {
	state: AppState = {
		inputValue: "",
		localId: undefined,
		remoteId: undefined,
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

	private handleRemovedInputKeyPress = (
		event: React.KeyboardEvent<HTMLInputElement>
	) => {
		if (event.key === "Enter") {
			this.setState({ inputValue: "", remoteId: this.state.inputValue })
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
		if (!this.state.remoteId) {
			return (
				<div>
					<input
						type="text"
						placeholder="Who do you want to talk to..."
						value={this.state.inputValue}
						onChange={this.handleInputChange}
						onKeyPress={this.handleRemovedInputKeyPress}
					/>
				</div>
			)
		}

		return <Chat localId={this.state.localId} remoteId={this.state.remoteId} />
	}
}

export default App
