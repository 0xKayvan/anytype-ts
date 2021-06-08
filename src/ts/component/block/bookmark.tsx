import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Icon, InputWithFile } from 'ts/component';
import { I, C, focus } from 'ts/lib';
import { commonStore } from 'ts/store';
import { observer } from 'mobx-react';

interface Props extends I.BlockComponent {};

const $ = require('jquery');
const { ipcRenderer } = window.require('electron');

@observer
class BlockBookmark extends React.Component<Props, {}> {

	_isMounted: boolean = false;

	constructor (props: any) {
		super(props);
		
		this.onKeyDown = this.onKeyDown.bind(this);
		this.onKeyUp = this.onKeyUp.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onChangeUrl = this.onChangeUrl.bind(this);
		this.onClick = this.onClick.bind(this);
	};

	render () {
		const { rootId, block, readOnly } = this.props;
		const { id, content } = block;
		const { url, title, description, imageHash, faviconHash } = content;

		let element = null;
		if (url) {
			let style: any = {};
			let cn = [ 'inner', 'resizable' ];

			if (imageHash) {
				cn.push('withImage');
				style.backgroundImage = 'url("' + commonStore.imageUrl(imageHash, 500) + '")';
			};
			
			element = (
				<div className={cn.join(' ')} onClick={this.onClick}>
					<div className="side left">
						{title ? <div className="name">{title}</div> : ''}
						{description ? <div className="descr">{description}</div> : ''}
						<div className="link">
							{faviconHash ? <Icon className="fav" icon={commonStore.imageUrl(faviconHash, 16)} /> : ''}
							{url}
						</div>
					</div>
					<div className="side right">
						<div className="img" style={style} />
					</div>
				</div>
			);
		} else {
			element = (
				<InputWithFile block={block} icon="bookmark" textFile="Paste a link" withFile={false} onChangeUrl={this.onChangeUrl} readOnly={readOnly} />
			);
		};
		
		return (
			<div className={[ 'focusable', 'c' + id ].join(' ')} tabIndex={0} onKeyDown={this.onKeyDown} onKeyUp={this.onKeyUp} onFocus={this.onFocus}>
				{element}
			</div>
		);
	};
	
	componentDidMount () {
		this._isMounted = true;
		this.resize();
		this.bind();
	};
	
	componentDidUpdate () {
		this.resize();
		this.bind();
	};
	
	componentWillUnmount () {
		this._isMounted = false;
		this.unbind();
	};
	
	onKeyDown (e: any) {
		this.props.onKeyDown(e, '', [], { from: 0, to: 0 });
	};
	
	onKeyUp (e: any) {
		this.props.onKeyUp(e, '', [], { from: 0, to: 0 });
	};

	onFocus () {
		const { block } = this.props;
		focus.set(block.id, { from: 0, to: 0 });
	};
	
	onClick (e: any) {
		if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) {
			return;
		};
		
		const { block } = this.props;
		const { content } = block;
		const { url } = content;
		
		ipcRenderer.send('urlOpen', url);
	};
	
	onChangeUrl (e: any, url: string) {
		const { rootId, block } = this.props;
		const { id } = block;
		
		C.BlockBookmarkFetch(rootId, id, url);
	};
	
	bind () {
		if (!this._isMounted) {
			return;
		};
		
		const node = $(ReactDOM.findDOMNode(this));
		node.unbind('resize').on('resize', (e: any) => { this.resize(); });
	};
	
	unbind () {
		if (!this._isMounted) {
			return;
		};
		
		const node = $(ReactDOM.findDOMNode(this));
		node.unbind('resize');
	};
	
	resize () {
		if (!this._isMounted) {
			return;
		};

		const { getWrapperWidth } = this.props;
		const node = $(ReactDOM.findDOMNode(this));
		const inner = node.find('.inner');
		const rect = node.get(0).getBoundingClientRect() as DOMRect;
		const width = rect.width;
		const mw = getWrapperWidth();
		
		width <= mw / 2 ? inner.addClass('vertical') : inner.removeClass('vertical');
	};
	
};

export default BlockBookmark;