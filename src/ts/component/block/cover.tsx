import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Icon, Drag, Cover, Loader } from 'ts/component';
import { I, C, Util, DataUtil, focus, translate } from 'ts/lib';
import { commonStore, blockStore, detailStore, menuStore } from 'ts/store';
import { observer } from 'mobx-react';

interface Props extends I.BlockComponent {}

interface State {
	isEditing: boolean;
	loading: boolean;
}

const $ = require('jquery');
const Constant = require('json/constant.json');
const { dialog } = window.require('electron').remote;

const BlockCover = observer(class BlockCover extends React.Component<Props, State> {
	
	_isMounted = false;
	state = {
		isEditing: false,
		loading: false,
	};
	cover: any = null;
	refDrag: any = null;
	rect: any = {};
	x: number = 0;
	y: number = 0;
	cx: number = 0;
	cy: number =  0;
	loaded: boolean = false;
	
	constructor (props: any) {
		super(props);
		
		this.onIcon = this.onIcon.bind(this);
		this.onCover = this.onCover.bind(this);
		this.onLayout = this.onLayout.bind(this);
		this.onRelation = this.onRelation.bind(this);

		this.onEdit = this.onEdit.bind(this);
		this.onSave = this.onSave.bind(this);
		this.onCancel = this.onCancel.bind(this);
		this.onUpload = this.onUpload.bind(this);
		this.onUploadStart = this.onUploadStart.bind(this);
		
		this.onScaleStart = this.onScaleStart.bind(this);
		this.onScaleMove = this.onScaleMove.bind(this);
		this.onScaleEnd = this.onScaleEnd.bind(this);
		
		this.onDragOver = this.onDragOver.bind(this);
		this.onDragLeave = this.onDragLeave.bind(this);
		this.onDrop = this.onDrop.bind(this);
		
		this.onDragStart = this.onDragStart.bind(this);
		this.onDragMove = this.onDragMove.bind(this);
		this.onDragEnd = this.onDragEnd.bind(this);
	};
	
	render () {
		const { config } = commonStore;
		const { isEditing, loading } = this.state;
		const { rootId, readOnly } = this.props;
		const object = detailStore.get(rootId, rootId, [ 'coverType', 'coverId' ], true);
		const { coverType, coverId } = object;
		const isImage = [ I.CoverType.Upload, I.CoverType.Image ].indexOf(coverType) >= 0;
		const root = blockStore.getLeaf(rootId, rootId);
		const allowedDetails = blockStore.isAllowed(rootId, rootId, [ I.RestrictionObject.Details ]);
		const allowedLayout = allowedDetails || blockStore.isAllowed(rootId, rootId, [ I.RestrictionObject.Layout ]);

		let elements = null;
		if (isEditing) {
			elements = (
				<React.Fragment>
					<div key="btn-drag" className="btn black drag withIcon">
						<Icon />
						<div className="txt">{translate('blockCoverDrag')}</div>
					</div>
					
					<div className="dragWrap">
						<Drag ref={(ref: any) => { this.refDrag = ref; }} onStart={this.onScaleStart} onMove={this.onScaleMove} onEnd={this.onScaleEnd} />
						<div id="dragValue" className="number">100%</div>
					</div>
					
					<div className="controlButtons">
						<div className="btn white" onMouseDown={this.onSave}>{translate('commonSave')}</div>
						<div className="btn white" onMouseDown={this.onCancel}>{translate('commonCancel')}</div>
					</div>
				</React.Fragment>
			);
		} else {
			elements = (
				<React.Fragment>
					<div className="controlButtons">
						{!root.isObjectTask() ? (
							<div id="button-icon" className="btn white withIcon" onClick={this.onIcon}>
								<Icon className="icon" />
								<div className="txt">{translate('editorControlIcon')}</div>
							</div>
						) : ''}

						<div id="button-cover" className="btn white withIcon" onClick={this.onCover}>
							<Icon className="addCover" />
							<div className="txt">{translate('editorControlCover')}</div>
						</div>

						{allowedLayout ? (
							<div id="button-layout" className="btn white withIcon" onClick={this.onLayout}>
								<Icon className="layout" />
								<div className="txt">{translate('editorControlLayout')}</div>
							</div>
						) : ''}

						{config.allowDataview ? (
							<div id="button-relation" className="btn white withIcon" onClick={this.onRelation}>
								<Icon className="relation" />
								<div className="txt">{translate('editorControlRelation')}</div>
							</div>
						) : ''}
					</div>
				</React.Fragment>
			);
		};

		return (
			<div 
				className={[ 'wrap', (isEditing ? 'isEditing' : '') ].join(' ')} 
				onMouseDown={this.onDragStart} 
				onDragOver={this.onDragOver} 
				onDragLeave={this.onDragLeave} 
				onDrop={this.onDrop}
			>
				{loading ? <Loader /> : ''}
				{isImage ? (
					<img id="cover" src="" className={[ 'cover', 'type' + coverType, coverId ].join(' ')} />
				) : (
					<Cover id={coverId} image={coverId} type={coverType} className={coverId} />
				)}
				{!readOnly ? (
					<div id="elements" className="elements">
						{elements}
					</div>
				) : ''}
			</div>
		);
	};
	
	componentDidMount () {
		this._isMounted = true;
		this.resize();

		const win = $(window);
		win.unbind('resize.cover').on('resize.cover', () => { this.resize(); });
	};
	
	componentDidUpdate () {
		this.resize();
	};
	
	componentWillUnmount () {
		this._isMounted = false;
		$(window).unbind('resize.cover');
	};

	onIcon (e: any) {
		const { rootId } = this.props;
		const root = blockStore.getLeaf(rootId, rootId);
		
		focus.clear(true);
		root.isObjectHuman() ? this.onIconUser() : this.onIconPage();
	};
	
	onIconPage () {
		const { rootId, block } = this.props;
		const node = $(ReactDOM.findDOMNode(this));
		const elements = node.find('.elements');
		
		menuStore.open('smile', { 
			element: `#block-${block.id} #button-icon`,
			onOpen: () => {
				elements.addClass('hover');
			},
			onClose: () => {
				elements.removeClass('hover');
			},
			data: {
				onSelect: (icon: string) => {
					DataUtil.pageSetIcon(rootId, icon, '');
				},
				onUpload (hash: string) {
					DataUtil.pageSetIcon(rootId, '', hash);
				},
			}
		});
	};
	
	onIconUser () {
		const { rootId } = this.props;
		const options: any = { 
			properties: [ 'openFile' ], 
			filters: [ { name: '', extensions: Constant.extension.cover } ]
		};
		
		dialog.showOpenDialog(options).then((result: any) => {
			const files = result.filePaths;
			if ((files == undefined) || !files.length) {
				return;
			};
			
			C.UploadFile('', files[0], I.FileType.Image, true, (message: any) => {
				if (message.error.code) {
					return;
				};
				
				DataUtil.pageSetIcon(rootId, '', message.hash);
			});
		});
	};

	onLayout (e: any) {
		const { rootId, block } = this.props;
		const node = $(ReactDOM.findDOMNode(this));
		const elements = node.find('.elements');
		const object = detailStore.get(rootId, rootId, []);
		
		menuStore.open('blockLayout', { 
			element: `#block-${block.id} #button-layout`,
			onOpen: () => {
				elements.addClass('hover');
			},
			onClose: () => {
				elements.removeClass('hover');
			},
			subIds: Constant.menuIds.layout,
			data: {
				rootId: rootId,
				value: object.layout,
				onChange: (layout: I.ObjectLayout) => {
					DataUtil.pageSetLayout(rootId, layout);
				},
			}
		});
	};

	onRelation () {
		const { isPopup, rootId, block } = this.props;
		const node = $(ReactDOM.findDOMNode(this));
		const elements = node.find('.elements');
		const win = $(window);
		const st = win.scrollTop();

		const param: any = {
			element: `#block-${block.id} #button-relation`,
			rect: { x: win.width() - 10, y: Util.sizeHeader() + st, width: 1, height: 1 },
			horizontal: I.MenuDirection.Right,
			noFlipX: true,
			noFlipY: true,
			subIds: Constant.menuIds.cell,
			onOpen: () => {
				elements.addClass('hover');
			},
			onClose: () => {
				elements.removeClass('hover');
				menuStore.closeAll();
			},
			data: {
				rootId: rootId,
			},
		};

		if (!isPopup) {
			param.classNameWrap = 'fromHeader';
		};

		menuStore.closeAll(null, () => { menuStore.open('blockRelationView', param); });
	};
	
	onCover (e: any) {
		const { rootId, block } = this.props;
		const node = $(ReactDOM.findDOMNode(this));
		const elements = node.find('.elements');
		
		focus.clear(true);
		menuStore.open('blockCover', {
			element: `#block-${block.id} #button-cover`,
			horizontal: I.MenuDirection.Center,
			onOpen: () => {
				elements.addClass('hover');
			},
			onClose: () => {
				elements.removeClass('hover');
			},
			data: {
				rootId: rootId,
				onEdit: this.onEdit,
				onUploadStart: this.onUploadStart,
				onUpload: this.onUpload,
				onSelect: (item: any) => {
					this.loaded = false;
					DataUtil.pageSetCover(rootId, item.type, item.id, item.coverX, item.coverY, item.coverScale);
				}
			},
		});
	};
	
	onEdit (e: any) {
		this.setState({ isEditing: true });
	};
	
	onUploadStart () {
		this.setState({ loading: true });
	};
	
	onUpload () {
		this.loaded = false;
		this.setState({ loading: false, isEditing: true });
	};
	
	onSave (e: any) {
		e.preventDefault();
		e.stopPropagation();
		
		this.setState({ isEditing: false });
	};
	
	onCancel (e: any) {
		e.preventDefault();
		e.stopPropagation();
		
		this.setState({ isEditing: false });
	};
	
	resize () {
		if (!this._isMounted) {
			return false;
		};
		
		const { rootId } = this.props;
		const object = detailStore.get(rootId, rootId, [ 'coverId', 'coverType', 'coverScale' ], true);
		const { coverId, coverType } = object;
		const node = $(ReactDOM.findDOMNode(this));
		const isImage = [ I.CoverType.Upload, I.CoverType.Image ].indexOf(coverType) >= 0;
		
		if (!isImage || !node.hasClass('wrap')) {
			return;
		};
		
		this.cover = node.find('.cover');
		
		const el = this.cover.get(0);
		if (!el) {
			return;
		};

		const cb = () => {
			const object = detailStore.get(rootId, rootId, [ 'coverScale' ], true);
			const { coverScale } = object;

			if (this.refDrag) {
				this.refDrag.setValue(coverScale);
			};

			this.rect = (node.get(0) as Element).getBoundingClientRect();
			this.onScaleMove(coverScale);
			this.cover.css({ opacity: 1 });
			this.loaded = true;
		};
		
		if (this.loaded) {
			cb();
		} else {
			this.cover.css({ opacity: 0 });
			el.onload = cb;
		};
		
		if (coverType == I.CoverType.Upload) {
			el.src = commonStore.imageUrl(coverId, Constant.size.cover);
		};

		if (coverType == I.CoverType.Image) {
			el.src = Util.coverSrc(coverId);
		};
	};
	
	onDragStart (e: any) {
		e.preventDefault();
		
		const { isEditing } = this.state;
		
		if (!this._isMounted || !isEditing) {
			return false;
		};
		
		const { dataset } = this.props;
		const { selection } = dataset || {};
		const win = $(window);
		const node = $(ReactDOM.findDOMNode(this));
		
		this.x = e.pageX - this.rect.x - this.x;
		this.y = e.pageY - this.rect.y - this.y;
		this.onDragMove(e);

		selection.preventSelect(true);
		node.addClass('isDragging');
		
		win.unbind('mousemove.cover mouseup.cover');
		win.on('mousemove.cover', (e: any) => { this.onDragMove(e); });
		win.on('mouseup.cover', (e: any) => { this.onDragEnd(e); });
	};
	
	onDragMove (e: any) {
		if (!this._isMounted || !this.rect) {
			return false;
		};
		
		const { x, y} = this.setTransform(e.pageX - this.rect.x - this.x, e.pageY - this.rect.y - this.y);
		this.cx = x;
		this.cy = y;
	};
	
	onDragEnd (e: any) {
		if (!this._isMounted) {
			return false;
		};
		
		const { rootId, dataset } = this.props;
		const { selection } = dataset || {};
		const win = $(window);
		const node = $(ReactDOM.findDOMNode(this));
		
		selection.preventSelect(false);
		win.unbind('mousemove.cover mouseup.cover');
		node.removeClass('isDragging');
		
		this.x = e.pageX - this.rect.x - this.x;
		this.y = e.pageY - this.rect.y - this.y;
	
		DataUtil.pageSetCoverXY(rootId, this.cx / this.rect.cw, this.cy / this.rect.ch);
	};
	
	onScaleStart (v: number) {
		if (!this._isMounted) {
			return false;
		};
		
		const { dataset } = this.props;
		const { selection } = dataset || {};
		
		selection.preventSelect(true);
	};
	
	onScaleMove (v: number) {
		if (!this._isMounted || !this.cover || !this.cover.length) {
			return false;
		};

		const node = $(ReactDOM.findDOMNode(this));
		const { rootId } = this.props;
		const object = detailStore.get(rootId, rootId, [ 'coverX', 'coverY' ], true);
		const { coverX, coverY } = object;
		const value = node.find('#dragValue');

		v = (v + 1) * 100;
		value.text(Math.ceil(v) + '%');
		this.cover.css({ height: 'auto', width: v + '%' });

		const rect = this.cover.get(0).getBoundingClientRect() as DOMRect;

		this.rect.cw = rect.width;
		this.rect.ch = rect.height;
		
		this.x = coverX * this.rect.cw;
		this.y = coverY * this.rect.ch;

		this.setTransform(this.x, this.y);
	};
	
	onScaleEnd (v: number) {
		if (!this._isMounted) {
			return false;
		};
		
		const { rootId, dataset } = this.props;
		const { selection } = dataset || {};

		selection.preventSelect(false);
		DataUtil.pageSetCoverScale(rootId, v);
	};
	
	onDragOver (e: any) {
		if (!this._isMounted || !e.dataTransfer.files || !e.dataTransfer.files.length) {
			return;
		};
		
		const node = $(ReactDOM.findDOMNode(this));
		node.addClass('isDraggingOver');
	};
	
	onDragLeave (e: any) {
		if (!this._isMounted || !e.dataTransfer.files || !e.dataTransfer.files.length) {
			return;
		};
		
		const node = $(ReactDOM.findDOMNode(this));
		node.removeClass('isDraggingOver');
	};
	
	onDrop (e: any) {
		if (!this._isMounted || !e.dataTransfer.files || !e.dataTransfer.files.length) {
			return;
		};
		
		const { rootId, dataset } = this.props;
		const { preventCommonDrop } = dataset || {};
		const file = e.dataTransfer.files[0].path;
		const node = $(ReactDOM.findDOMNode(this));
		
		node.removeClass('isDraggingOver');
		preventCommonDrop(true);
		this.setState({ loading: true });
		
		C.UploadFile('', file, I.FileType.Image, true, (message: any) => {
			this.setState({ loading: false });
			preventCommonDrop(false);
			
			if (message.error.code) {
				return;
			};
			
			this.loaded = false;
			DataUtil.pageSetCover(rootId, I.CoverType.Upload, message.hash);
		});
	};
	
	setTransform (x: number, y: number) {
		let mx = this.rect.cw - this.rect.width;
		let my = this.rect.ch - this.rect.height;

		x = Math.max(-mx, Math.min(0, x));
		y = Math.max(-my, Math.min(0, y));
		
		let css: any = { transform: `translate3d(${x}px,${y}px,0px)` };
		
		if (this.rect.ch < this.rect.height) {
			css.transform = 'translate3d(0px,0px,0px)';
			css.height = this.rect.height;
			css.width = 'auto';
		};
		
		this.cover.css(css);
		return { x: x, y: y };
	};
	
	checkPercent (p: number): number {
		return Math.min(1, Math.max(0, p));
	};

});

export default BlockCover;