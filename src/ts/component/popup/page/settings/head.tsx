import * as React from 'react';
import { Icon } from 'Component';

interface Props {
	returnTo?: string;
	prevPage?: string;
	name: string;
	onPage: (id: string) => void;
};

class PopupSettingsHead extends React.Component<Props, object> {

	render () {
		const { name, returnTo, prevPage, onPage } = this.props;

		return (
			<div className="head">
				<div className="element" onClick={() => { onPage(returnTo || prevPage); }}>
					<Icon className="back" />
					{name}
				</div>
			</div>
		);
	};

	

};

export default PopupSettingsHead;