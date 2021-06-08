import * as React from 'react';
import { I, Util } from 'ts/lib';
import { commonStore } from 'ts/store';

interface Props {
	id?: string;
	image?: string;
	src?: string;
	className?: string;
	type?: number;
	x?: number;
	y?: number;
	scale?: number;
	withScale?: boolean;
	preview?: boolean;
	onClick?(e: any): void;
	onMouseDown?(e: any): void;
};

const Constant = require('json/constant.json');

class Cover extends React.Component<Props, {}> {

	private static defaultProps = {
		type: 0,
		x: 0.5,
		y: 0.5,
		scale: 0,
	};

	render () {
		const { id, image, src, type, x, y, scale, withScale, className, preview, onClick, onMouseDown } = this.props;

		let cn = [ 'cover', 'type' + type, id ];
		let style: any = {};
		
		if (className) {
			cn.push(className);
		};

		if ((type == I.CoverType.Upload) && image) {
			style.backgroundImage = `url("${commonStore.imageUrl(image, Constant.size.cover)}")`;
		};

		if ((type == I.CoverType.Image) && id) {
			style.backgroundImage = `url("${Util.coverSrc(id, preview)}")`;
		};

		if (src) {
			style.backgroundImage = `url("${src}")`;
		};
		
		if (withScale) {
			style.backgroundPosition = `${Math.abs(x * 100)}% ${Math.abs(y * 100)}%`;
			style.backgroundSize = ((scale + 1) * 100) + '%';
		};
		
		return (
			<div className={cn.join(' ')} onClick={onClick} onMouseDown={onMouseDown} style={style} />
		);
	};
	
};

export default Cover;