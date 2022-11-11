import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { RouteComponentProps } from 'react-router';
import { I, keyboard, Util, C, focus, Renderer } from 'Lib';
import { Icon } from 'Component';
import { observer } from 'mobx-react';
import { menuStore, commonStore, blockStore } from 'Store';
import { getRange, setRange } from 'selection-ranges';
import * as Prism from 'prismjs';

import 'katex/dist/katex.min.css';
import 'prismjs/themes/prism.css';

import Constant from 'json/constant.json';

interface Props extends I.BlockComponent, RouteComponentProps<any> {};
interface State {
	isEditing: boolean;
};

const raf = require('raf');
const $ = require('jquery') as JQueryStatic;
const katex = require('katex');

require('prismjs/components/prism-latex.js');
require('katex/dist/contrib/mhchem.min.js');

const BlockLatex = observer(class BlockLatex extends React.Component<Props, State> {

	_isMounted: boolean = false;
	ref: any = null;
	range: any = { start: 0, end: 0 };
	text: string = '';
	timeout: number = 0;

	state = {
		isEditing: false,
	};

	constructor (props: any) {
		super(props);

		this.onKeyDownBlock = this.onKeyDownBlock.bind(this);
		this.onKeyUpBlock = this.onKeyUpBlock.bind(this);
		this.onFocusBlock = this.onFocusBlock.bind(this);

		this.onKeyDownInput = this.onKeyDownInput.bind(this);
		this.onKeyUpInput = this.onKeyUpInput.bind(this);
		this.onFocusInput = this.onFocusInput.bind(this);
		this.onBlurInput = this.onBlurInput.bind(this);

		this.onChange = this.onChange.bind(this);
		this.onPaste = this.onPaste.bind(this);
		this.onEdit = this.onEdit.bind(this);
		this.onSelect = this.onSelect.bind(this);
		this.onMenu = this.onMenu.bind(this);
		this.onTemplate = this.onTemplate.bind(this);
	};

	render () {
		const { readonly, block } = this.props;
		const { isEditing } = this.state;
		const { content } = block;
		const { text } = content;
		const cn = [ 'wrap', 'resizable', 'focusable', 'c' + block.id, (isEditing ? 'isEditing' : '') ];

		return (
			<div 
				tabIndex={0} 
				className={cn.join(' ')}
				onKeyDown={this.onKeyDownBlock} 
				onKeyUp={this.onKeyUpBlock} 
				onFocus={this.onFocusBlock}
			>
				<div id="select" className="select" onClick={this.onTemplate}>
					<div className="name">Template formula</div>
					<Icon className="arrow light" />
				</div>

				<div id="value" onClick={this.onEdit} />
				<div id="empty" className="empty" onClick={this.onEdit}>
					Here your equation will be rendered with <Icon className="tex" />. Click to edit
				</div>
				<div 
					id="input"
					contentEditable={!readonly}
					suppressContentEditableWarning={true}
					ref={(ref: any) => { this.ref = ref; }}
					placeholder="Enter text in format LaTeX" 
					onSelect={this.onSelect}
					onFocus={this.onFocusInput}
					onBlur={this.onBlurInput}
					onKeyUp={this.onKeyUpInput} 
					onKeyDown={this.onKeyDownInput}
					onChange={this.onChange}
					onPaste={this.onPaste}
				/>
			</div>
		);
	};

	get node() {
		return $(ReactDOM.findDOMNode(this));
	}

	get win() {
		return $(window);
	}

	get input() {
		return this.node.find('#input').get(0);
	}
	
	componentDidMount () {
		const { block } = this.props;
		

		this.text = String(block.content.text || '');
		const length = this.text.length;

		this._isMounted = true;
		this.setRange({ start: length, end: length });
		this.setValue(this.text);

		this.node.off('resize').on('resize', (e: any) => { this.resize(); });
	};

	componentDidUpdate () {
		const { block } = this.props;
		const { isEditing } = this.state;
		
		this.text = String(block.content.text || '');

		this.unbind();
		this.setValue(this.text);

		if (isEditing) {
			this.focus();
			this.rebind();
		};
	};
	
	componentWillUnmount () {
		this._isMounted = false;
		this.unbind();
	};

	rebind () {
		const { block } = this.props;

		this.unbind();

		this.win.on('click.latex', (e: any) => {
			if (!this._isMounted) {
				return;
			};

			if ($(e.target).parents(`#block-${block.id}`).length > 0) {
				return;
			};

			menuStore.close('blockLatex');
			window.clearTimeout(this.timeout);
			
			this.placeholderCheck(this.getValue());
			this.save(() => { 
				this.setState({ isEditing: false });

				menuStore.close('previewLatex');
			});
		});
	};

	unbind () {
		this.win.off('click.latex');
	};

	focus () {
		if (!this._isMounted) {
			return;
		};

		if (this.range) {
			setRange(this.input, this.range);
		};
	};

	onFocusBlock () {
		const { block } = this.props;
		focus.set(block.id, { from: 0, to: 0 });

		this.focus();
	};

	onKeyDownBlock (e: any) {
		const { rootId, onKeyDown } = this.props;
		const { isEditing } = this.state;
		const cmd = keyboard.cmdKey();

		if (isEditing) {
			// Undo
			keyboard.shortcut(`${cmd}+z`, e, (pressed: string) => {
				e.preventDefault();
				keyboard.onUndo(rootId, (message: any) => { focus.clear(true); });
			});

			// Redo
			keyboard.shortcut(`${cmd}+shift+z`, e, (pressed: string) => {
				e.preventDefault();
				keyboard.onRedo(rootId, (message: any) => { focus.clear(true); });
			});
		};
		
		if (onKeyDown && !isEditing) {
			onKeyDown(e, '', [], { from: 0, to: 0 }, this.props);
		};
	};
	
	onKeyUpBlock (e: any) {
		const { onKeyUp } = this.props;
		const { isEditing } = this.state;

		if (onKeyUp && !isEditing) {
			onKeyUp(e, '', [], { from: 0, to: 0 }, this.props);
		};
	};

	onKeyDownInput (e: any) {
		if (!this._isMounted) {
			return;
		};

		const { filter } = commonStore;
		const range = getRange(this.input);

		keyboard.shortcut('backspace', e, (pressed: string) => {
			if (range && (range.start == filter.from)) {
				menuStore.close('blockLatex');
			};
		});
	};

	onKeyUpInput (e: any) {
		if (!this._isMounted) {
			return;
		};

		const { filter } = commonStore;
		const value = this.getValue();
		const range = getRange(this.input);
		const symbolBefore = value[range?.start - 1];

		let menuOpen = menuStore.isOpen('blockLatex');

		if ((symbolBefore == '\\') && !keyboard.isSpecial(e)) {
			commonStore.filterSet(range.start, '');
			this.onMenu(e, 'input', false);
		};

		if (menuOpen) {
			const d = range.start - filter.from;
			if (d >= 0) {
				const part = value.substr(filter.from, d).replace(/^\\/, '');
				commonStore.filterSetText(part);
			};
		};

		this.setContent(value);
		this.save();
	};

	updateRect () {
		const rect = Util.selectionRect();

		if (!rect || !menuStore.isOpen('blockLatex')) {
			return;
		};

		menuStore.update('blockLatex', { 
			rect: { ...rect, y: rect.y + this.win.scrollTop() }
		});
	};

	onChange (e: any) {
		this.setValue(this.getValue());
	};

	onPaste (e: any) {
		if (!this._isMounted) {
			return;
		};

		e.preventDefault();

		const range = getRange(this.input);
		const cb = e.clipboardData || e.originalEvent.clipboardData;

		this.setValue(Util.stringInsert(this.getValue(), cb.getData('text/plain'), range.start, range.end));

		const length = this.getValue().length;
		this.setRange({ start: length, end: length });
		this.focus();
	};

	onFocusInput () {
		keyboard.setFocus(true);
	};

	onBlurInput () {
		keyboard.setFocus(false);
		window.clearTimeout(this.timeout);

		this.save();
	};

	onTemplate (e: any) {
		if (!this._isMounted) {
			return;
		};

		const range = getRange(this.input);

		commonStore.filterSet(range?.start, '');
		this.onMenu(e, 'select', true);
	};

	onMenu (e: any, element: string, isTemplate: boolean) {
		if (!this._isMounted) {
			return;
		};

		const { rootId, block } = this.props;

		raf(() => {
			let rect = null;
			menuStore.open('blockLatex', {
				recalcRect: () => {
					let rect = null;
					if (element == 'input') {
						rect = Util.selectionRect();
					};
					return rect ? { ...rect, y: rect.y + this.win.scrollTop() } : null;
				},
				element: `#block-${block.id} #${element}`,
				offsetY: 4,
				offsetX: rect ? 0 : Constant.size.blockMenu,
				commonFilter: true,
				className: (isTemplate ? 'isTemplate' : ''),
				subIds: Constant.menuIds.latex,
				onClose: () => {
					commonStore.filterSet(0, '');
				},
				data: {
					isTemplate: isTemplate,
					rootId: rootId,
					blockId: block.id,
					onSelect: (from: number, to: number, item: any) => {
						let text = item.symbol || item.comment;
						if (isTemplate) {
							text = ' ' + text;
						};
						
						this.setValue(Util.stringInsert(this.getValue(), text, from, to));
						this.save();
						this.setRange({ start: to, end: to });
						this.focus();
					},
				},
			});
		});
	};

	setValue (value: string) {
		if (!this._isMounted) {
			return '';
		};


		this.input.innerHTML = Prism.highlight(value, Prism.languages.latex, 'latex');

		this.setContent(value);
	};

	getValue (): string {
		if (!this._isMounted) {
			return '';
		};
		
		return String(this.input.innerText || '');
	};

	setContent (value: string) {
		if (!this._isMounted) {
			return '';
		};

		const val = this.node.find('#value');

		value = String(value || '');
		this.text = value;

		if (val.length) {
			val.html(value ? katex.renderToString(value, { 
				displayMode: true, 
				throwOnError: false,
				output: 'html',
				trust: (context: any) => [ '\\url', '\\href', '\\includegraphics' ].includes(context.command),
			}) : '');
		};

		val.find('a').each((i: number, item: any) => {
			item = $(item);

			item.off('click').click((e: any) => {
				e.preventDefault();
				Renderer.send('urlOpen', item.attr('href'));
			});
		});

		this.placeholderCheck(value);
		this.updateRect();
		this.resize();
	};

	placeholderCheck (value: string) {
		const empty = this.node.find('#empty');

		value = value.trim();
		value.length ? empty.hide() : empty.show();
	};

	onEdit (e: any) {
		const { readonly } = this.props;
		if (readonly) {
			return;
		};

		e.stopPropagation();
		this.setState({ isEditing: true });
	};

	save (callBack?: (message: any) => void) {
		const { rootId, block, readonly } = this.props;
		if (readonly) {
			return;
		};

		const value = this.getValue();

		blockStore.updateContent(rootId, block.id, { text: value });
		C.BlockLatexSetText(rootId, block.id, value, callBack);
	};

	setRange (range: any) {
		this.range = range || { start: 0, end: 0 };
	};

	onSelect (e: any) {
		if (!this._isMounted) {
			return;
		};

		const { dataset } = this.props;
		const { selection } = dataset || {};

		this.setRange(getRange(this.input));
		
		selection.preventSelect(true);

		this.win.off('mouseup.latex').on('mouseup.latex', (e: any) => {	
			selection.preventSelect(false);
			this.win.off('mouseup.latex');
		});
	};

	resize () {
		if (!this._isMounted) {
			return;
		};

		const value = this.node.find('#value');

		value.css({ height: 'auto' });
		value.css({ height: value.height() + 20 });
	};

});

export default BlockLatex;