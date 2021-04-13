import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { RouteComponentProps } from 'react-router';
import { DragLayer } from 'ts/component';
import { I, C, focus, keyboard, Util, scrollOnMove } from 'ts/lib';
import { blockStore } from 'ts/store';
import { observer } from 'mobx-react';
import { throttle } from 'lodash';

interface Props extends RouteComponentProps<any> {
	dataset?: any;
	rootId: string;
	isPopup: boolean;
};

const $ = require('jquery');
const Constant = require('json/constant.json');

const OFFSET = 100;
const THROTTLE = 20;

@observer
class DragProvider extends React.Component<Props, {}> {

	refLayer: any = null;
	type: string = '';
	ids: string[] = [];
	map: any;
	commonDropPrevented: boolean = false;
	position: I.BlockPosition = I.BlockPosition.None;
	hoverData: any = null;
	canDrop: boolean = false;
	timeoutHover: number = 0;
	init: boolean = false;
	top: number = 0;

	objects: any = null;
	objectData: Map<string, any> = new Map();
	emptyObj: any = null;

	constructor (props: any) {
		super(props);

		this.onDragOver = this.onDragOver.bind(this);
		this.onDragStart = this.onDragStart.bind(this);
		this.onDragMove = this.onDragMove.bind(this);
		this.onDragEnd = this.onDragEnd.bind(this);
		this.onDropCommon = this.onDropCommon.bind(this);
		this.onDrop = this.onDrop.bind(this);
		this.preventCommonDrop = this.preventCommonDrop.bind(this);
	};

	render () {
		const { rootId } = this.props;
		const children = this.injectProps(this.props.children);

		return (
			<div className="dragProvider" onDragOver={this.onDragOver} onDrop={this.onDropCommon}>
				<DragLayer {...this.props} ref={(ref: any) => { this.refLayer = ref; }} rootId={rootId} />
				{children}
			</div>
		);
	};

	initData () {
		if (this.init) {
			return;
		};

		this.init = true;
		this.objects = $('.dropTarget');
		this.emptyObj = $('<div class="dragEmpty" />');
		this.emptyObj.css({ height: $('#dragLayer').height() });

		this.objects.each((i: number, el: any) => {
			const item = $(el);
			const data = item.data();
			const offset = item.offset();
			const rect = el.getBoundingClientRect() as DOMRect;

			let x = offset.left;
			let y = offset.top;
			let w = rect.width;
			let h = rect.height;
			let isTargetTop = item.hasClass('targetTop');
			let isTargetBot = item.hasClass('targetBot');
			let key = data.id;

			if (isTargetTop) key += '-top';
			if (isTargetBot) key += '-bot';

			// Add block's paddings to height
			if ((data.dropType == I.DragItem.Block) && (data.type != I.BlockType.Layout)) {
				const block = $('#block-' + data.id);
				if (block.length) {
					const top = parseInt(block.css('paddingTop'));
					const bot = parseInt(block.css('paddingBottom'));

					y -= top + 2;
					h += top + bot + 2;
				};
			};

			this.objectData.set(key, {
				...data,
				obj: item,
				index: i,
				width: w,
				height: h,
				x: x,
				y: y,
				isTargetTop: isTargetTop,
				isTargetBot: isTargetBot,
			});
		});
	};

	onDropCommon (e: any) {
		if (this.commonDropPrevented) {
			return;
		};

		const { rootId } = this.props;
		const dt = (e.dataTransfer || e.originalEvent.dataTransfer);

		let data: any = {};
		if (this.hoverData) {
			data = this.hoverData;
		};
		let targetId = String(data.id || '');

		if (dt.files && dt.files.length) {
			let paths: string[] = [];
			for (let file of dt.files) {
				paths.push(file.path);
			};

			console.log('[dragProvider.onDrop] paths', paths);
			C.ExternalDropFiles(rootId, targetId, this.position, paths);
		} else
		if (this.hoverData && this.canDrop && (this.position != I.BlockPosition.None)) {
			this.onDrop(e, data.dropType, data.rootId, targetId, this.position);
		};

		this.clear();
	};

	onDragOver (e: any) {
		e.preventDefault();
   		e.stopPropagation();

		this.initData();
		this.onDragMove(e);
	};

	onDragStart (e: any, type: string, ids: string[], component: any) {
		const { rootId, dataset, isPopup } = this.props;
		const { selection } = dataset || {};
		const win = $(window);
		const node = $(ReactDOM.findDOMNode(this));
		const layer = $('#dragLayer');

		e.stopPropagation();
		focus.clear(true);

		console.log('[dragProvider.onDragStart]', type, ids);

		this.top = this.getScrollContainer().scrollTop();
		this.map = blockStore.getMap(rootId);
		this.refLayer.show(type, ids, component);
		this.set(type, ids);
		this.unbind();
		this.initData();

		e.dataTransfer.setDragImage(layer.get(0), 0, 0);
		node.addClass('isDragging');
		keyboard.setDrag(true);
		Util.linkPreviewHide(false);

		win.on('dragend.drag', (e: any) => { this.onDragEnd(e); });
		win.on('drag.drag', throttle((e: any) => { this.onDragMove(e); }, THROTTLE));

		$('.colResize.active').removeClass('active');
		scrollOnMove.onMouseDown(e, isPopup);

		if (selection) {
			selection.set(this.ids);
			selection.hide();
			selection.preventSelect(true);
		};
	};

	onDragMove (e: any) {
		const { isPopup } = this.props;
		const dt = (e.dataTransfer || e.originalEvent.dataTransfer);
		const isFileDrag = dt.types.indexOf('Files') >= 0;
		const top = this.getScrollContainer().scrollTop();
		const d = top > this.top ? 1 : -1;
		const diff = isPopup ? Math.abs(top - this.top) * d : 0;

		this.checkNodes(e.pageX, e.pageY + diff, isFileDrag);
		scrollOnMove.onMouseMove(e.clientX, e.clientY);
	};

	onDragEnd (e: any) {
		const { dataset } = this.props;
		const { selection } = dataset || {};
		const node = $(ReactDOM.findDOMNode(this));

		this.refLayer.hide();
		this.unbind();
		this.clear();

		keyboard.setDrag(false);
		node.removeClass('isDragging');

		if (selection) {
			selection.preventSelect(false);
			selection.preventClear(false);
		};

		$('.block.isDragging').removeClass('isDragging');
		scrollOnMove.onMouseUp(e);
	};

	onDrop (e: any, type: string, rootId: string, targetId: string, position: I.BlockPosition) {
		const { dataset } = this.props;
		const { selection } = dataset || {};
		const target = blockStore.getLeaf(rootId, targetId);
		const map = blockStore.getMap(rootId);
		const element = map[targetId];

		if (!target || !element) {
			return;
		};

		const parent = blockStore.getLeaf(rootId, element.parentId);

		let targetContextId = rootId;
		let contextId = rootId;

		if (target.isLink() && (position == I.BlockPosition.Inner)) {
			contextId = this.props.rootId;
			targetContextId = target.content.targetBlockId;
			targetId = '';

			if (contextId == targetContextId) {
				console.log('[dragProvider.onDrop] Contexts are equal');
				return;
			};
		};

		if (parent && parent.isLayoutColumn() && ([ I.BlockPosition.Left, I.BlockPosition.Right ].indexOf(position) >= 0)) {
			targetId = parent.id;
		};

		if (selection) {
			selection.preventClear(false);
			selection.clearState();
		};

		console.log('[dragProvider.onDrop]', type, targetId, this.type, this.ids, position);

		C.BlockListMove(contextId, targetContextId, this.ids || [], targetId, position, () => {
			if (selection) {
				selection.set(this.ids);
			};
		});
	};

	checkNodes (ex: number, ey: number, isFileDrag: boolean) {
		const { rootId } = this.props;

		this.hoverData = null;
		this.position = I.BlockPosition.None;

		if (this.emptyObj) {
			this.emptyObj.remove();
		};

		this.objectData.forEach((value: any) => {
			let { x, y, width, height, dropType } = value;

			if (dropType == I.DragItem.Block) {
				x -= OFFSET;
				width += OFFSET * 2;
			};

			if ((ex >= x) && (ex <= x + width) && (ey >= y) && (ey <= y + height)) {
				this.hoverData = value;
			};
		});

		this.canDrop = true;

		if (this.hoverData) {
			if (!isFileDrag && (this.type == I.DragItem.Block)) {
				let parentIds: string[] = [];
				this.getParentIds(this.hoverData.id, parentIds);

				for (let dropId of this.ids) {
					if ((dropId == this.hoverData.id) || (parentIds.length && (parentIds.indexOf(dropId) >= 0))) {
						this.canDrop = false;
						break;
					};
				};
			};

			const { x, y, width, height } = this.hoverData;
			const obj = $(this.hoverData.obj);
			const type = obj.attr('data-type');
			const style = Number(obj.attr('data-style')) || 0;
			const col1 = x - Constant.size.blockMenu / 4;
			const col2 = x + width;
			const isText = type == I.BlockType.Text;
			const isFeatured = type == I.BlockType.Featured;

			if (ex <= col1) {
				this.position = I.BlockPosition.Left;
			} else
			if ((ex > col1) && (ex <= col2)) {
				if (ey <= y + height * 0.15) {
					this.position = I.BlockPosition.Top;
				} else
				if (ey >= y + height * 0.85) {
					this.position = I.BlockPosition.Bottom;
				} else {
					this.position = I.BlockPosition.Inner;
				};
			} else
			if (ex > col2) {
				this.position = I.BlockPosition.Right;
			};

			// You can't drop on Icon
			if ([ I.BlockType.IconPage, I.BlockType.IconUser ].indexOf(type) >= 0) {
				this.position = I.BlockPosition.None;
			};

			// You can't drop on Title and Description
			if (isText && ([ I.TextStyle.Title, I.TextStyle.Description ].indexOf(style) >= 0)) {
				this.position = I.BlockPosition.None;
			};

			// You cant only drop into Paragraphs and list
			if (
				(this.position == I.BlockPosition.Inner) &&
				isText &&
				[ I.TextStyle.Paragraph, I.TextStyle.Toggle, I.TextStyle.Checkbox, I.TextStyle.Numbered, I.TextStyle.Bulleted ].indexOf(style) < 0
			) {
				this.position = I.BlockPosition.None;
			};

			if (
				(this.position == I.BlockPosition.Inner) &&
				([ I.BlockType.Text, I.BlockType.Link ].indexOf(type) < 0)
			) {
				this.position = I.BlockPosition.None;
			};

			// You can't drop on Featured
			if (isFeatured) {
				this.position = I.BlockPosition.None;
			};

			// You can drop vertically on Layout.Row
			if ((type == I.BlockType.Layout) && (style == I.LayoutStyle.Row)) {
				if (this.hoverData.isTargetTop) {
					this.position = I.BlockPosition.Top;
				};
				if (this.hoverData.isTargetBot) {
					this.position = I.BlockPosition.Bottom;
				};
			};

			// You can only drop inside of menu items
			if ((this.hoverData.dropType == I.DragItem.Menu) && (this.position != I.BlockPosition.None)) {
				this.position = I.BlockPosition.Inner;

				if (rootId == this.hoverData.targetContextId) {
					this.position = I.BlockPosition.None;
				};
			};
		};

		window.clearTimeout(this.timeoutHover);
		if ((this.position != I.BlockPosition.None) && this.canDrop) {
			$('.dropTarget.isOver').removeClass('isOver top bottom left right middle');
			this.hoverData.obj.addClass('isOver ' + this.getDirectionClass(this.position));
		} else {
			this.timeoutHover = window.setTimeout(() => {
				$('.dropTarget.isOver').removeClass('isOver top bottom left right middle');
			}, 10);
		};
	}; 

	unbind () {
		$(window).unbind('dragend.drag drag.drag');
	};

	set (type: string, ids: string[]) {
		this.type = type;
		this.ids = ids.map((id: any) => { return id.toString(); });

		$('.block.isDragging').removeClass('isDragging');
		for (let id of this.ids) {
			$('#block-' + id).addClass('isDragging');
		};
	};

	getScrollContainer () {
		return this.props.isPopup ? $('#popupPage #innerWrap') : $(window);
	};

	getParentIds (id: string, parentIds: string[]) {
		const { rootId } = this.props;
		const item = this.map[id];

		if (!item || (item.parentId == rootId)) {
			return;
		};

		parentIds.push(item.parentId);
		this.getParentIds(item.parentId, parentIds);
	};

	getDirectionClass (dir: I.BlockPosition) {
		let c = '';
		switch (dir) {
			case I.BlockPosition.None:	 c = ''; break;
			case I.BlockPosition.Top:	 c = 'top'; break;
			case I.BlockPosition.Bottom: c = 'bottom'; break;
			case I.BlockPosition.Left:	 c = 'left'; break;
			case I.BlockPosition.Right:	 c = 'right'; break;
			case I.BlockPosition.Inner:	 c = 'middle'; break;
		};
		return c;
	};

	injectProps (children: any) {
		return React.Children.map(children, (child: any) => {
			let children = child.props.children;
			let dataset = child.props.dataset || {};

			if (children) {
				child = React.cloneElement(child, { children: this.injectProps(children) });
			};

			dataset.dragProvider = this;
			dataset.onDragStart = this.onDragStart;
			dataset.onDrop = this.onDrop;
			dataset.preventCommonDrop = this.preventCommonDrop;

			return React.cloneElement(child, { dataset: dataset });
		});
	};

	preventCommonDrop (v: boolean) {
		this.commonDropPrevented = Boolean(v);
	};

	clear () {
		if (this.emptyObj) {
			this.emptyObj.remove();
			this.emptyObj = null;
		};

		if (this.hoverData) {
			this.hoverData.obj.removeClass('isOver top bottom left right middle');
			this.hoverData = null;
		};

		this.init = false;
		this.position = I.BlockPosition.None;
		this.objects = null;
		this.objectData.clear();
	};

};

export default DragProvider;
