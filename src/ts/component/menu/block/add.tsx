import * as React from 'react';
import { MenuItemVertical, Icon, Cell } from 'ts/component';
import { I, keyboard, Key, C, focus, Action, Util, DataUtil, Storage, translate } from 'ts/lib';
import { blockStore, commonStore, dbStore, menuStore, detailStore, popupStore } from 'ts/store';
import { observer } from 'mobx-react';
import { AutoSizer, CellMeasurer, InfiniteLoader, List, CellMeasurerCache } from 'react-virtualized';

interface Props extends I.Menu {};

interface State {
	loading: boolean;
	n: number;
};

const $ = require('jquery');
const Constant = require('json/constant.json');
const HEIGHT = 28;
const HEIGHT_SECTION = 42;
const HEIGHT_DESCRIPTION = 56;
const HEIGHT_RELATION = 32;
const LIMIT = 40;

@observer
class MenuBlockAdd extends React.Component<Props, State> {
	
	_isMounted = false;
	emptyLength: number = 0;
	timeout: number = 0;
	cache: any = {};
	relations: any[] = [];
	state = {
		loading: false,
		n: 0,
	};
	
	constructor (props: any) {
		super(props);
		
		this.rebind = this.rebind.bind(this);
		this.onOver = this.onOver.bind(this);
		this.onClick = this.onClick.bind(this);
	};
	
	render () {
		const { param } = this.props;
		const { data } = param;
		const { rootId, blockId } = data;
		const { filter } = commonStore;
		const { n } = this.state;
		const items = this.getItems();
		const block = blockStore.getLeaf(rootId, blockId);
		const length = block.getLength();
		const idPrefix = 'menuBlockAdd';

		const rowRenderer = (param: any) => {
			const { index } = param;
			const item: any = items[index];
			
			let content = null;
			if (item.isRelationAdd) {
				content =  (
					<div 
						id="item-relation-add" 
						className="item add" 
						onClick={(e: any) => { this.onClick(e, item); }} 
						onMouseEnter={(e: any) => { this.onMouseEnter(e, item); }} 
						style={param.style}
					>
						<Icon className="plus" />
						<div className="name">{item.name}</div>
					</div>
				);
			} else 
			if (item.isSection) {
				content = <div className={[ 'sectionName', (index == 0 ? 'first' : '') ].join(' ')} style={param.style}>{item.name}</div>;
			} else
			if (item.isRelation) {
				const id = DataUtil.cellId(idPrefix, item.relationKey, '0');

				content = (
					<div 
						id={'item-' + item.id}
						className={[ 'item', 'sides', (item.isHidden ? 'isHidden' : '') ].join(' ')} 
						onMouseEnter={(e: any) => { this.onMouseEnter(e, item); }} 
						onClick={(e: any) => { this.onClick(e, item); }} 
						style={param.style}
					>
						<div className="info">
							{item.name}
						</div>
						<div
							id={id} 
							className={[ 'cell', DataUtil.relationClass(item.format), 'canEdit' ].join(' ')} 
							onClick={(e: any) => { this.onClick(e, item); }}
						>
							<Cell 
								rootId={rootId}
								storeId={rootId}
								block={block}
								relationKey={item.relationKey}
								getRecord={() => { return detailStore.get(rootId, rootId, [ item.relationKey ]); }}
								viewType={I.ViewType.Grid}
								index={0}
								idPrefix={idPrefix}
								menuClassName="fromBlock"
								scrollContainer={Util.getEditorScrollContainer('menuBlockRelationList')}
								pageContainer={Util.getEditorPageContainer('menuBlockRelationList')}
								readOnly={true}
								canOpen={false}
							/>
						</div>
					</div>
				);
			} else {
				let cn = [];
				let icn: string[] = [ 'inner' ];
					
				if (item.isTextColor) {
					icn.push('textColor textColor-' + item.value);
				};
				if (item.isBgColor) {
					icn.push('bgColor bgColor-' + item.value);
				};
				
				if (item.isTextColor || item.isBgColor) {
					item.icon = 'color';
					item.inner = (
						<div className={icn.join(' ')} />
					);
				};

				if (item.isBig) {
					cn.push('isBig');
				};

				if (item.isHidden) {
					cn.push('isHidden');
				};

				if (item.isObject) {
					item.object = { 
						iconEmoji: item.iconEmoji, 
						decription: item.description,
						layout: I.ObjectLayout.ObjectType,
					};
					item.iconSize = 40;
				};
				
				content = (
					<MenuItemVertical 
						key={item.id + '-' + index} 
						{...item} 
						className={cn.join(' ')}
						withDescription={item.isBlock} 
						onMouseEnter={(e: any) => { this.onMouseEnter(e, item); }} 
						onClick={(e: any) => { this.onClick(e, item); }} 
						style={param.style}
					/>
				);
			};

			return (
				<CellMeasurer
					key={param.key}
					parent={param.parent}
					cache={this.cache}
					columnIndex={0}
					rowIndex={index}
					hasFixedWidth={() => {}}
				>
					{content}
				</CellMeasurer>
			);
		};

		return (
			<div className="wrap">
				{!items.length ? (
					<div className="item empty">{translate('commonFilterEmpty')}</div>
				) : (
					<div className="items">
						<InfiniteLoader
							rowCount={items.length}
							loadMoreRows={() => {}}
							isRowLoaded={() => { return true; }}
							threshold={LIMIT}
						>
							{({ onRowsRendered, registerChild }) => (
								<AutoSizer className="scrollArea">
									{({ width, height }) => (
										<List
											ref={registerChild}
											width={width}
											height={height}
											deferredMeasurmentCache={this.cache}
											rowCount={items.length}
											rowHeight={({ index }) => { return this.rowHeight(items[index], index); }}
											rowRenderer={rowRenderer}
											onRowsRendered={onRowsRendered}
											overscanRowCount={10}
											scrollToIndex={n}
										/>
									)}
								</AutoSizer>
							)}
						</InfiniteLoader>
					</div>
				)}
			</div>
		);
	};
	
	componentDidMount () {
		const { getId } = this.props;
		const { n } = this.state;
		const items = this.getItems();
		
		this._isMounted = true;
		this.rebind();
		this.checkFilter();
		this.setActive(items[n]);
		this.resize();
		this.load();

		this.cache = new CellMeasurerCache({
			fixedWidth: true,
			defaultHeight: HEIGHT,
			keyMapper: (i: number) => { return (items[i] || {}).id; },
		});
		
		const menu = $('#' + getId());
		menu.unbind('mouseleave').on('mouseleave', () => {
			window.clearTimeout(this.timeout);
		});
	};
	
	componentDidUpdate () {
		const { filter } = commonStore;
		const items = this.getItems();
		const { n } = this.state;

		if (!items.length && !this.emptyLength) {
			this.emptyLength = filter.text.length;
		};

		if ((filter.text.length - this.emptyLength > 3) && !items.length) {
			this.props.close();
			return;
		};

		this.checkFilter();
		this.setActive(items[n]);
		this.resize();
	};

	load () {
		const { param } = this.props;
		const { data } = param;
		const { rootId } = data;
		const { config } = commonStore;

		this.setState({ loading: true });

		C.ObjectRelationListAvailable(rootId, (message: any) => {
			this.relations = message.relations.sort(DataUtil.sortByName).map((it: any) => {
				it.id = it.relationKey;
				it.type = I.BlockType.Relation;
				it.isRelation = true;
				it.isBlock = true;
				return it;
			});

			this.relations = this.relations.filter((it: any) => {
				if (!config.debug.ho && it.isHidden) {
					return false;
				};
				return [ I.RelationScope.Object, I.RelationScope.Type ].indexOf(it.scope) >= 0;
			});

			this.relations.unshift({
				id: 'add',
				name: 'New relation',
				type: I.BlockType.Relation,
				isRelationAdd: true,
				isBlock: true,
			});

			this.setState({ loading: false });
		});
	};
	
	checkFilter () {
		const { filter } = commonStore;
		const obj = $('#menuBlockAdd');
		
		filter ? obj.addClass('withFilter') : obj.removeClass('withFilter');
	};
	
	componentWillUnmount () {
		this._isMounted = false;
		
		const { param } = this.props;
		const { data } = param;
		const { rebind } = data;

		this.unbind();
		
		if (rebind) {
			rebind();
		};

		menuStore.closeAll(Constant.menuIds.add);
	};
	
	rebind () {
		this.unbind();
		
		const win = $(window);
		win.on('keydown.menu', (e: any) => { this.onKeyDown(e); });
	};
	
	unbind () {
		$(window).unbind('keydown.menu');
	};
	
	setActive = (item?: any, scroll?: boolean) => {
		const items = this.getItems();
		if (item) {
			this.state.n = items.findIndex((it: any) => { return it.id == item.id; });
		};
		this.props.setHover((item ? item : items[this.state.n]), scroll);
	};
	
	onKeyDown (e: any) {
		if (!this._isMounted) {
			return;
		};
		
		e.stopPropagation();
		keyboard.disableMouse(true);
		
		let { n } = this.state;

		const k = e.key.toLowerCase();
		const items = this.getItems();
		const l = items.length;
		const item = items[n];

		switch (k) {
			case Key.up:
				e.preventDefault();
				n--;
				if (n < 0) {
					n = l - 1;
				};
				this.setState({ n: n });
				this.setActive(null, true);
				break;
				
			case Key.down:
				e.preventDefault();
				n++;
				if (n > l - 1) {
					n = 0;
				};
				this.setState({ n: n });
				this.setActive(null, true);
				break;
				
			case Key.tab:
			case Key.enter:
				e.preventDefault();
				
				if (item) {
					item.arrow ? this.onOver(e, item) : this.onClick(e, item);					
				};
				break;
			
			case Key.escape:
				this.props.close();
				break;
		};
	};
	
	getSections () {
		const { param } = this.props;
		const { filter } = commonStore;
		const { data } = param;
		const { blockId, rootId } = data;
		const block = blockStore.getLeaf(rootId, blockId);
		const { config } = commonStore;
		
		if (!block) {
			return [];
		};

		let sections: any[] = [
			{ id: 'text', name: 'Text', children: DataUtil.menuGetBlockText() },
			{ id: 'list', name: 'List', children: DataUtil.menuGetBlockList() },
			{ id: 'media', name: 'Media', children: DataUtil.menuGetBlockMedia() },
			{ id: 'other', name: 'Other', children: DataUtil.menuGetBlockOther() },
			{ id: 'object', name: 'Objects', children: DataUtil.menuGetBlockObject() },
		];

		sections = sections.map((s: any) => {
			s.children = s.children.map((c: any) => {
				c.isBig = true;
				return c;
			});
			return s;
		});

		if (config.allowDataview) {
			sections = sections.concat([
				{ id: 'relation', name: 'Relations', children: this.relations },
			]);
		};
		
		if (filter && filter.text) {
			sections = sections.concat([
				{ id: 'action', icon: 'action', name: 'Actions', color: '', children: DataUtil.menuGetActions(false) },
			]);

			if (block.canHaveAlign()) {
				sections.push({ id: 'align', icon: 'align', name: 'Align', color: '', children: DataUtil.menuGetAlign(block.isTextQuote()) });
			};
			if (block.canHaveColor()) {
				sections.push({ id: 'color', icon: 'color', name: 'Text color', color: '', children: DataUtil.menuGetTextColors() });
			};
			if (block.canHaveBackground()) {
				sections.push({ id: 'bgColor', icon: 'bgColor', name: 'Background color', color: '', children: DataUtil.menuGetBgColors() });
			};
			
			sections = DataUtil.menuSectionsFilter(sections, filter.text);
		};
		
		sections = DataUtil.menuSectionsMap(sections);
		return sections;
	};
	
	getItems () {
		const sections = this.getSections();
		
		let items: any[] = [];
		for (let section of sections) {
			items.push({ id: section.id, name: section.name, isSection: true });
			items = items.concat(section.children);
		};
		
		return items;
	};
	
	onMouseEnter (e: any, item: any) {
		if (!keyboard.isMouseDisabled) {
			this.onOver(e, item);
		};
	};
	
	onOver (e: any, item: any) {
		this.setActive(item, false);

		if (!item.arrow) {
			menuStore.closeAll(Constant.menuIds.add);
			return;
		};

		const { param, getId, getSize, close } = this.props;
		const { data } = param;
		const { rootId, blockId, blockCreate } = data;
		const { config, filter } = commonStore;
		const types = dbStore.getObjectTypesForSBType(I.SmartBlockType.Page).map((it: I.ObjectType) => { return it.id; });
		const block = blockStore.getLeaf(rootId, blockId);

		const filters = [
			{ operator: I.FilterOperator.And, relationKey: 'type', condition: I.FilterCondition.In, value: types },
		];

		if (!config.allowDataview) {
			filters.push({ operator: I.FilterOperator.And, relationKey: 'id', condition: I.FilterCondition.In, value: [ Constant.typeId.page ] });
		};

		const text = Util.stringCut(data.text, filter.from - 1, filter.from + filter.text.length);
		const length = text.length;
		const position = length ? I.BlockPosition.Bottom : I.BlockPosition.Replace;

		let menuId = '';
		let menuParam: I.MenuParam = {
			menuKey: item.itemId,
			element: `#${getId()} #item-${item.id}`,
			offsetX: getSize().width,
			vertical: I.MenuDirection.Center,
			isSub: true,
			className: param.className,
			data: {
				rootId: rootId,
				skipId: rootId,
				blockId: blockId,
				blockIds: [ blockId ],
				position: position,
				onSelect: () => {
					$(`#block-${blockId} .value`).text(text);

					DataUtil.blockSetText(rootId, block, text, block.content.marks, true, () => {
						focus.set(blockId, { from: length, to: length });
						focus.apply();
					});

					close();
				},
			},
		};

		switch (item.itemId) {	
			case 'move':
				menuId = 'searchObject';
				menuParam.offsetY = -36;

				menuParam.data = Object.assign(menuParam.data, {
					type: I.NavigationType.Move, 
					filters: filters,
				});
				break;

			case 'existing':
				menuId = 'searchObject';

				menuParam.data = Object.assign(menuParam.data, {
					type: I.NavigationType.Link,
				});
				break;

		};

		if (menuId && !menuStore.isOpen(menuId, item.itemId)) {
			menuStore.closeAll(Constant.menuIds.add, () => {
				menuStore.open(menuId, menuParam);
			});
		};
	};
	
	onClick (e: any, item: any) {
		e.stopPropagation();

		if (item.arrow) {
			return;
		};
		
		const { param, close } = this.props;
		const { data } = param;
		const { rootId, blockId, onSelect, blockCreate } = data;
		const { filter } = commonStore;
		const block = blockStore.getLeaf(rootId, blockId);
		if (!block) {
			return;
		};

		keyboard.setFocus(false);

		let text = String(data.text || '');

		const details: any = {};
		const length = text.length;
		const position = length ? I.BlockPosition.Bottom : I.BlockPosition.Replace; 
		const onCommand = (message: any) => {
			focus.set(message.blockId || blockId, { from: length, to: length });
			focus.apply();
		};

		const cb = () => {
			text = Util.stringCut(text, filter.from - 1, filter.from + filter.text.length);

			if (item.isTextColor) {
				C.BlockListSetTextColor(rootId, [ blockId ], item.value, onCommand);
			};

			if (item.isBgColor) {
				C.BlockListSetBackgroundColor(rootId, [ blockId ], item.value, onCommand);
			};

			if (item.isAlign) {
				C.BlockListSetAlign(rootId, [ blockId ], item.itemId, onCommand);
			};

			if (item.isAction) {
				switch (item.itemId) {
					case 'download':
						Action.download(block);
						break;

					case 'copy':
						Action.duplicate(rootId, blockId, [ blockId ]);
						break;
					
					case 'remove':
						Action.remove(rootId, blockId, [ blockId ]);
						break;
				};
			};

			if (item.isBlock) {
				let param: any = {
					type: item.type,
					content: {},
				};
					
				if (item.type == I.BlockType.Text) {
					param.content.style = item.itemId;

					if (param.content.style == I.TextStyle.Code) {
						param.fields = { 
							lang: (Storage.get('codeLang') || Constant.default.codeLang),
						};
					};
				};

				if (item.type == I.BlockType.File) {
					param.content.type = item.itemId;
				};
				
				if (item.type == I.BlockType.Div) {
					param.content.style = item.itemId;
				};

				if (item.type == I.BlockType.Relation) {
					param.content.key = item.relationKey;
				};

				if ((item.type == I.BlockType.Text) && (item.itemId != I.TextStyle.Code)) {
					C.BlockListSetTextStyle(rootId, [ blockId ], item.itemId, onCommand);
				} else 
				if (item.isObject) {
					const type = dbStore.getObjectType(item.objectTypeId);
					if (type) {
						details.type = type.id;
						details.layout = type.layout;
					};

					const create = (templateId: string) => {
						DataUtil.pageCreate(rootId, blockId, details, position, templateId, (message: any) => {
							DataUtil.objectOpenPopup({ ...details, id: message.targetId });
						});
					};

					const showMenu = () => {
						popupStore.open('template', {
							data: {
								typeId: item.objectTypeId,
								onSelect: create,
							},
						});
					};

					DataUtil.checkTemplateCnt([ item.objectTypeId ], 2, (message: any) => {
						if (message.records.length > 1) {
							showMenu();
						} else {
							create(message.records.length ? message.records[0].id : '');
						};
					});
				} else 
				if (item.type == I.BlockType.Page) {
					DataUtil.pageCreate(rootId, blockId, details, position, '', (message: any) => {
						DataUtil.objectOpenPopup({ ...details, id: message.targetId });
					});
				} else {
					blockCreate(blockId, position, param, (blockId: string) => {

						// Auto-open BlockRelation suggest menu
						if ((param.type == I.BlockType.Relation) && !param.content.key) {
							window.setTimeout(() => {  
								$(`#block-${blockId} .info`).trigger('click');
							}, Constant.delay.menu);
						};
					});
				};
			};

			close();
		};

		if (onSelect) {
			onSelect(e, item);
		};

		// Clear filter in block text
		if (block) {
			// Hack to prevent onBlur save
			$(`#block-${blockId} .value`).text(text);
			DataUtil.blockSetText(rootId, block, text, block.content.marks, true, cb);
		} else {
			cb();
		};
	};

	resize () {
		const { getId, position } = this.props;
		const items = this.getItems();
		const obj = $(`#${getId()} .content`);
		
		let height = 16;
		for (let i = 0; i < items.length; ++i) {
			height += this.rowHeight(items[i], i);
		};
		height = Math.max(HEIGHT + 18, Math.min(360, height));

		obj.css({ height: height });
		position();
	};

	rowHeight (item: any, index: number) {
		if (item.isRelation || item.isRelationAdd) {
			return HEIGHT_RELATION;
		};
		if (item.isSection) {
			return index > 0 ? HEIGHT_SECTION : HEIGHT;
		};
		return item.isBlock ? HEIGHT_DESCRIPTION : HEIGHT;
	};

};

export default MenuBlockAdd;