import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Icon, Pager } from 'ts/component';
import { I, C, Util, DataUtil, translate, keyboard } from 'ts/lib';
import { dbStore, menuStore, blockStore } from 'ts/store';
import { AutoSizer, WindowScroller, List } from 'react-virtualized';
import { observer } from 'mobx-react';
import arrayMove from 'array-move';

import HeadRow from './grid/head/row';
import BodyRow from './grid/body/row';

interface Props extends I.ViewComponent {};

const $ = require('jquery');
const Constant = require('json/constant.json');
const PADDING = 32;

@observer
class ViewGrid extends React.Component<Props, {}> {

	constructor (props: any) {
		super (props);

		this.onRowOver = this.onRowOver.bind(this);
		this.onCellAdd = this.onCellAdd.bind(this);
		this.onResizeStart = this.onResizeStart.bind(this);
		this.onSortEnd = this.onSortEnd.bind(this);
	};

	render () {
		const { rootId, block, getData, getView, readOnly, onRowAdd, isPopup, scrollContainer } = this.props;
		const view = getView();
		const relations = view.relations.filter((it: any) => { return it.isVisible; });
		const data = dbStore.getData(rootId, block.id);
		const { offset, total } = dbStore.getMeta(rootId, block.id);
		const allowed = blockStore.isAllowed(rootId, block.id, [ I.RestrictionDataview.Object ]);

		return (
			<div className="wrap">
				<div className="scroll">
					<div className="scrollWrap">
						<div className="viewItem viewGrid">
							<HeadRow {...this.props} onCellAdd={this.onCellAdd} onSortEnd={this.onSortEnd} onResizeStart={this.onResizeStart} />

							<WindowScroller scrollElement={isPopup ? $('#popupPage #innerWrap').get(0) : window}>
								{({ height, isScrolling, registerChild, scrollTop }) => {
									return (
										<AutoSizer disableHeight>
											{({ width }) => {
												return (
													<div ref={registerChild}>
														<List
															autoHeight
															height={Number(height) || 0}
															isScrolling={isScrolling}
															rowCount={total}
															rowHeight={48}
															rowRenderer={({ key, index, style }) => {
																return (
																	<BodyRow 
																		key={'grid-row-' + view.id + index} 
																		{...this.props} 
																		readOnly={readOnly || !allowed}
																		index={index} 
																		onRowOver={this.onRowOver} 
																		style={style}
																	/>
																);
															}}
															scrollTop={scrollTop}
															width={width}
														/>
													</div>
												);
											}}
										</AutoSizer>
									);
								}}
							</WindowScroller>

							{!readOnly && allowed ? (
								<div className="row add">
									<div className="cell add">
										<div className="btn" onClick={onRowAdd}>
											<Icon className="plus" />
											<div className="name">{translate('blockDataviewNew')}</div>
										</div>
									</div>
								</div>
							) : null}
						</div>
					</div>
				</div>
			</div>
		);
	};

	componentDidMount () {
		this.resize();
		this.bind();
	};

	componentDidUpdate () {
		const win = $(window);

		this.bind();
		this.resize();
		this.onScroll();

		win.trigger('resize.editor');
	};

	componentWillUnmount () {
		this.unbind();
	};

	bind () {
		const node = $(ReactDOM.findDOMNode(this));
		const scroll = node.find('.scroll');

		scroll.unbind('.scroll').scroll(this.onScroll);
	};

	unbind () {
		const node = $(ReactDOM.findDOMNode(this));
		const scroll = node.find('.scroll');

		scroll.unbind('.scroll');
	};

	onScroll () {
		const win = $(window);
		const { list } = menuStore;

		for (let menu of list) {
			win.trigger('resizeMenu.' + Util.toCamelCase('menu-' + menu.id));
		};
	};

	resize () {
		const { getView, scrollContainer } = this.props;
		const view = getView();
		const node = $(ReactDOM.findDOMNode(this));
		const scroll = node.find('.scroll');
		const wrap = node.find('.scrollWrap');
		const ww = $(scrollContainer).width();
		const mw = ww - PADDING * 2;

		let vw = 0;
		let margin = 0;
		let width = 48;
		let pr = 0;

		for (let relation of view.relations) {
			if (relation.isVisible) {
				width += relation.width;
			};
		};

		vw = width <= mw ? mw : width;
		margin = (ww - mw) / 2;

		if (width > mw) {
			pr = PADDING;
			vw += PADDING;
		};

		scroll.css({ width: ww, marginLeft: -margin, paddingLeft: margin });
		wrap.css({ width: vw, paddingRight: pr });
		
		this.resizeLast();
	};

	resizeLast () {
		const { getView } = this.props;
		const view = getView();
		const win = $(window);
		const node = $(ReactDOM.findDOMNode(this));
		const lastHead = node.find('.cellHead.last');
		const ww = win.width();
		const mw = ww - 192;
		
		let width = 0;
		for (let relation of view.relations) {
			if (!relation.isVisible) {
				continue;
			};
			width += relation.width;
		};

		lastHead.css({ width: (width > mw ? 48 : 'auto') });
	};

	onResizeStart (e: any, id: string) {
		e.preventDefault();
		e.stopPropagation();

		const win = $(window);

		$('body').addClass('colResize');
		win.unbind('mousemove.cell mouseup.cell');
		win.on('mousemove.cell', (e: any) => { this.onResizeMove(e, id); });
		win.on('mouseup.cell', (e: any) => { this.onResizeEnd(e, id); });

		keyboard.setResize(true);
	};

	onResizeMove (e: any, id: string) {
		e.preventDefault();
		e.stopPropagation();

		const { getView } = this.props;
		const view = getView();
		const node = $(ReactDOM.findDOMNode(this));
		const el = node.find('#' + DataUtil.cellId('head', id, ''));
		const offset = el.offset();
		const idx = view.relations.findIndex((it: I.ViewRelation) => { return it.relationKey == id; });

		let width = e.pageX - offset.left;
		width = Math.max(Constant.size.dataview.cell.min, width); 
		width = Math.min(Constant.size.dataview.cell.max, width);

		view.relations[idx].width = width;
		el.css({ width: width });
		node.find('.resizable').trigger('resize');

		this.resizeLast();
	};

	onResizeEnd (e: any, id: string) {
		const { rootId, block, getView } = this.props;
		const view = getView();

		$(window).unbind('mousemove.cell mouseup.cell').trigger('resize');
		$('body').removeClass('colResize');

		C.BlockDataviewViewUpdate(rootId, block.id, view.id, view);

		window.setTimeout(() => { keyboard.setResize(false); }, 50);
	};

	onRowOver (id: number) {
		const node = $(ReactDOM.findDOMNode(this));

		node.find('.row.active').removeClass('active');
		node.find('#row-' + id).addClass('active');
	};

	onCellAdd (e: any) {
		const { rootId, block, readOnly, getData, getView } = this.props;
		const view = getView();
		const relations = DataUtil.viewGetRelations(rootId, block.id, view);

		menuStore.open('relationSuggest', { 
			element: `#cell-add`,
			horizontal: I.MenuDirection.Right,
			data: {
				readOnly: readOnly,
				getData: getData,
				getView: getView,
				rootId: rootId,
				blockId: block.id,
				menuIdEdit: 'dataviewRelationEdit',
				filter: '',
				skipIds: relations.map((it: I.ViewRelation) => { return it.relationKey; }),
				addCommand: (rootId: string, blockId: string, relation: any) => {
					DataUtil.dataviewRelationAdd(rootId, blockId, relation, getView(), (message: any) => { menuStore.close('relationSuggest'); });
				},
				listCommand: (rootId: string, blockId: string, callBack?: (message: any) => void) => {
					C.BlockDataviewRelationListAvailable(rootId, blockId, callBack);
				},
			}
		});
	};

	onSortEnd (result: any) {
		const { rootId, block, getView } = this.props;
		const { oldIndex, newIndex } = result;
		const view = getView();
		const filtered = view.relations.filter((it: any) => { return it.isVisible; });
		const oldIdx = view.relations.findIndex((it: I.ViewRelation) => { return it.relationKey == filtered[oldIndex].relationKey; });
		const newIdx = view.relations.findIndex((it: I.ViewRelation) => { return it.relationKey == filtered[newIndex].relationKey; });
		
		view.relations = arrayMove(view.relations, oldIdx, newIdx);
		C.BlockDataviewViewUpdate(rootId, block.id, view.id, view);
	};
	
};

export default ViewGrid;