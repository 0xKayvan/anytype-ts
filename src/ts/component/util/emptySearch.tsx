import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import raf from 'raf';

interface Props {
	text: string;
};

class EmptySearch extends React.Component<Props, object> {

	_isMounted: boolean = false;

	render () {
		const { text } = this.props;
		
		return (
			<div className="emptySearch">
				<div className="txt" dangerouslySetInnerHTML={{ __html: text }} />
			</div>
		);
	};
	
	componentDidMount () {
		this._isMounted = true;
		this.resize();
	};

	componentDidUpdate () {
		this.resize();
	};

	componentWillUnmount () {
		this._isMounted = false;
	};

	resize () {
		raf(() => {
			if (!this._isMounted) {
				return;
			};

			const node = $(ReactDOM.findDOMNode(this));
			node.css({ lineHeight: node.height() + 'px' });
		});
	};

};

export default EmptySearch;