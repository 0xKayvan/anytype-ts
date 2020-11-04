import * as React from 'react';
import { Icon } from 'ts/component';

const Constant = require('json/constant.json');

interface Props {
	text?: string;
	className?: string;
	color?: string;
	canEdit?: boolean;
	onRemove?: (e: any, text: string) => void;
};

class Tag extends React.Component<Props, {}> {

	render () {
		let { text, className, canEdit, onRemove } = this.props;
		let color = this.props.color || this.getColor();
		let cn = [ 'tagItem', color ];
		
		if (className) {
			cn.push(className);
		};
		if (canEdit) {
			cn.push('canEdit');
		};
		
		return (
			<span contentEditable={false} className={cn.join(' ')}>
				<span className="inner">{text}</span>
				{canEdit ? <Icon className="remove" onMouseDown={(e: any) => { onRemove(e, text); }} /> : '' }
			</span>
		);
	};
	
	getColor (): string {
		const a = Object.keys(Constant.textColor);
		
		let text = String(this.props.text || '');
		let n = 0;
		for (let i = 0; i < text.length; i++) {
			n += text.charCodeAt(i);
		};
		return a[n % a.length];
	};
	
};

export default Tag;