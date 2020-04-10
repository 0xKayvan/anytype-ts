import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Util } from 'ts/lib';

interface Props {
	text: string;
	className?: string;
};

const $ = require('jquery');

class Label extends React.Component<Props, {}> {

	render () {
		const { text, className } = this.props;
		
		let cn = [ 'label' ];
		if (className) {
			cn.push(className);
		};
		
		return (
			<div className={cn.join(' ')} dangerouslySetInnerHTML={{ __html: text }} />
		);
	};
	
	componentDidMount () {
		Util.renderLink($(ReactDOM.findDOMNode(this)));
	};
	
};

export default Label;