import * as React from 'react';

class Tooltip extends React.Component<{}, {}> {

	render () {
		return (
			<div id="tooltip" className="tooltip">
				<div className="txt" />
			</div>
		);
	};

};

export default Tooltip;