import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Icon, Input, Button } from 'ts/component';
import { I, keyboard, focus, Util } from 'ts/lib';

const { dialog } = window.require('electron').remote;

const $ = require('jquery');
const raf = require('raf');
const SMALL_WIDTH = 248;
const ICON_WIDTH = 60;

enum Size { Icon = 0, Small = 1, Full = 2 };

interface Props {
	icon?: string;
	textUrl?: string;
	textFile?: string;
	withFile?: boolean;
	accept?: string[];
	block?: I.Block;
	onChangeUrl? (e: any, url: string): void;
	onChangeFile? (e: any, path: string): void;
};

interface State {
	focused: boolean;
	size: Size;
};

class InputWithFile extends React.Component<Props, State> {

	private static defaultProps = {
		textUrl: 'Paste a link',
		withFile: true,
	};
	
	_isMounted: boolean = false;
	state = {
		focused: false,
		size: Size.Full,
	};
	
	t = 0;
	urlRef: any = null;

	constructor (props: any) {
		super(props);
		
		this.onSubmit = this.onSubmit.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.onClickFile = this.onClickFile.bind(this);
	};
	
	render () {
		const { focused, size } = this.state;
		const { icon, textUrl, textFile, withFile } = this.props;

		let cn = [ 'inputWithFile', 'resizable' ];		
		let placeHolder = textUrl;
		let onFocus = focused ? () => {} : this.onFocus;
		let onBlur = focused ? this.onBlur : () => {};
		let or = ' or ';
		let onClick = (e: any) => {};
		let isSmall = size == Size.Small;
		let isIcon = size == Size.Icon;
		
		if (!withFile) {
			cn.push('noFile');
		};
		
		if (isSmall) {
			cn.push('isSmall');
		};
		
		if (isIcon) {
			cn.push('isIcon');
			onClick = (e: any) => { this.onClickFile(e); };
		};
		
		if (focused) {
			cn.push('isFocused');
		};
		
		if (withFile && focused) {
			placeHolder += or + (!isSmall ? textFile : '');
		};
		
		return (
			<div className={cn.join(' ')} onClick={onClick}>
				{icon ? <Icon className={icon} /> : ''}
			
				<div id="text" className="txt">
					<form id="form" onSubmit={this.onSubmit}>
						{focused ? (
							<span>
								<Input id="url" ref={(ref: any) => { this.urlRef = ref; }} placeHolder={placeHolder} onPaste={(e: any) => { this.onChangeUrl(e, true); }} onFocus={onFocus} onBlur={onBlur} />
								<Button type="input" className="dn" />
							</span>
						) : (
							<span className="urlToggle" onClick={this.onFocus}>{textUrl + (withFile && isSmall ? or : '')}</span>
						)}
					</form>
					{withFile ? (
						<span className="fileWrap" onMouseDown={this.onClickFile}>
							{!isSmall ? <span>&nbsp;or&nbsp;</span> : ''}
							<span className="border">{textFile}</span>
						</span>
					) : ''}
				</div>
			</div>
		);
	};
	
	componentDidMount () {
		this._isMounted = true;
		this.resize();
		this.bind();
	};
	
	componentDidUpdate () {
		const { focused } = focus;
		const { block } = this.props;
		
		this.resize();
		this.bind();
		
		if (this.state.focused) {
			if (this.urlRef) {
				this.urlRef.focus();
			};
			focus.set(block.id, { from: 0, to: 0 });
		};
	};
	
	componentWillUnmount () {
		const { focused } = focus;
		const { block } = this.props;
		
		this._isMounted = false;
		this.unbind();
		
		if (focused == block.id) {
			keyboard.setFocus(false);
		};
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
		raf(() => {
			if (!this._isMounted) {
				return;
			};
			
			const node = $(ReactDOM.findDOMNode(this));
			const width = node.width();
			
			let size = Size.Full;
			if (width <= SMALL_WIDTH) {
				size = Size.Small;
			};
			if (width <= ICON_WIDTH) {
				size = Size.Icon;
			};
			
			if (size != this.state.size) {
				this.setState({ size: size });	
			};
		});
	};
	
	onFocus (e: any) {
		e.stopPropagation();
		this.setState({ focused: true });
	};
	
	onBlur (e: any) {
		e.stopPropagation();
		this.setState({ focused: false });
	};
	
	focus () {
		this.setState({ focused: true });
	};
	
	onChangeUrl (e: any, force: boolean) {
		const { onChangeUrl } = this.props;
		
		window.clearTimeout(this.t);
		this.t = window.setTimeout(() => {
			if (!this.urlRef) {
				return;
			};
			
			let url = this.urlRef.getValue() || '';
			if (!url) {
				return;
			};
			
			if (onChangeUrl) {
				onChangeUrl(e, url);
			};
		}, force ? 50 : 1000);
	};
	
	onClickFile (e: any) {
		const { onChangeFile, accept } = this.props;
		
		e.preventDefault();
		e.stopPropagation();
		
		let options: any = { 
			properties: [ 'openFile' ], 
			filters: [  ] 
		};
		if (accept) {
			options.filters = [
				{ name: '', extensions: accept }
			];
		};
		
		dialog.showOpenDialog(options).then((result: any) => {
			const files = result.filePaths;
			if ((files == undefined) || !files.length) {
				return;
			};
			
			if (onChangeFile) {
				onChangeFile(e, files[0]);	
			};
		});
	};
	
	onSubmit (e: any) {
		e.preventDefault();
		this.onChangeUrl(e, true);
	};
	
};

export default InputWithFile;