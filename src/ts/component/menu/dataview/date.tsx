import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { MenuItemVertical } from 'ts/component';
import { I, C, Key, keyboard, Util, DataUtil } from 'ts/lib';
import { menuStore, dbStore } from 'ts/store';
import { observer } from 'mobx-react';

interface Props extends I.Menu {};

const $ = require('jquery');

@observer
class MenuDataviewDate extends React.Component<Props, {}> {

	_isMounted: boolean = false;
	n: number = 0;

	render () {
		const sections = this.getSections();

		const Section = (item: any) => (
			<div className="section">
				{item.name ? <div className="name">{item.name}</div> : ''}
				<div className="items">
					{item.children.map((action: any, i: number) => {
						return <MenuItemVertical key={i} {...action} onClick={(e: any) => { this.onClick(e, action); }} onMouseEnter={(e: any) => { this.onOver(e, action); }} />;
					})}
				</div>
			</div>
		);

		return (
			<div className="items">
				{sections.map((item: any, i: number) => (
					<Section key={i} {...item} />
				))}
			</div>
		);
	};
	
	componentDidMount () {
		this._isMounted = true;
		this.rebind();
	};

	componentDidUpdate () {
		const items = this.getItems();

		this.setActive(items[this.n]);
		this.props.position();
	};
	
	componentWillUnmount () {
		this._isMounted = false;
		this.unbind();
	};

	rebind () {
		if (!this._isMounted) {
			return;
		};
		
		this.unbind();
		
		const win = $(window);
		win.on('keydown.menu', (e: any) => { this.onKeyDown(e); });
	};
	
	unbind () {
		const win = $(window);
		const node = $(ReactDOM.findDOMNode(this));

		win.unbind('keydown.menu');
		node.find('.items').unbind('scroll.menu');
	};

	getSections () {
		const { param } = this.props;
		const { data } = param;
		const { rootId, getView, relationKey } = data;

		let relation = null;
		let dateFormat = null;
		let timeFormat = null;

		if (getView) {
			const view = getView();
			relation = view.getRelation(relationKey);
		} else {
			relation = dbStore.getRelation(rootId, rootId, relationKey);
		};

		if (relation) {
			const dateOptions = this.getOptions('dateFormat');
			const timeOptions = this.getOptions('timeFormat');

			dateFormat = dateOptions.find((it: any) => { return it.id == relation.dateFormat; }) || dateOptions[0];
			timeFormat = timeOptions.find((it: any) => { return it.id == relation.timeFormat; }) || timeOptions[0];
		};

		let sections = [
			{ 
				id: 'date', name: 'Date format', children: [
					{ id: 'dateFormat', name: dateFormat.name, arrow: true }
				] 
			},
			{ 
				id: 'time', name: 'Time format', children: [
					{ id: 'timeFormat', name: timeFormat.name, arrow: true }
				] 
			},
		];

		sections = DataUtil.menuSectionsMap(sections);
		return sections;
	};
	
	getItems () {
		const sections = this.getSections();
		
		let items: any[] = [];
		for (let section of sections) {
			items = items.concat(section.children);
		};
		
		return items;
	};

	getOptions (key: string) {
		let options = [];
		switch (key) {
			case 'dateFormat':
				options = [
					{ id: I.DateFormat.MonthAbbrBeforeDay, name: Util.date('M d, Y', Util.time()) },
					{ id: I.DateFormat.MonthAbbrAfterDay, name: Util.date('d M, Y', Util.time()) },
					{ id: I.DateFormat.Short, name: Util.date('d.m.Y', Util.time()) },
					{ id: I.DateFormat.ShortUS, name: Util.date('m.d.Y', Util.time()) },
					{ id: I.DateFormat.ISO, name: Util.date('Y-m-d', Util.time()) },
				];
				break;

			case 'timeFormat':
				options = [
					{ id: I.TimeFormat.H12, name: '12 hour' },
					{ id: I.TimeFormat.H24, name: '24 hour' },
				];
				break;
		};
		return options;
	};
	
	setActive = (item?: any, scroll?: boolean) => {
		const items = this.getItems();
		if (item) {
			this.n = items.findIndex((it: any) => { return it.id == item.id; });
		};
		this.props.setHover(items[this.n], scroll);
	};

	onKeyDown (e: any) {
		if (!this._isMounted) {
			return;
		};
		
		e.stopPropagation();

		const k = e.key.toLowerCase();
		keyboard.disableMouse(true);
		
		const items = this.getItems();
		const l = items.length;
		const item = items[this.n];
		
		switch (k) {
			case Key.up:
				e.preventDefault();
				this.n--;
				if (this.n < 0) {
					this.n = l - 1;
				};
				this.setActive(null, true);
				break;
				
			case Key.down:
				e.preventDefault();
				this.n++;
				if (this.n > l - 1) {
					this.n = 0;
				};
				this.setActive(null, true);
				break;
				
			case Key.tab:
			case Key.enter:
				e.preventDefault();
				if (item) {
					this.onClick(e, item);
				};
				break;
				
			case Key.escape:
				this.props.close();
				break;
		};
	};

	onClick (e: any, item: any) {
		const { param, close } = this.props;
		const { data } = param;
		const { rootId, blockId, relationKey, getView } = data;

		let relation = null;
		let view = null;
		let idx = 0;

		if (getView) {
			view = getView();
			idx = view.relations.findIndex((it: I.ViewRelation) => { return it.relationKey == relationKey; });

			relation = view.getRelation(relationKey);
		} else {
			relation = dbStore.getRelation(rootId, rootId, relationKey);
		};

		const options = this.getOptions(item.itemId);
		const value = options.find((it: any) => { return it.id == relation[item.itemId]; }) || options[0];

		menuStore.open('select', {
			element: '#item-' + item.id,
			offsetX: 208,
			offsetY: -38,
			horizontal: I.MenuDirection.Right,
			data: {
				value: value.name,
				options: options,
				onSelect: (e: any, el: any) => {
					if (view) {
						view.relations[idx][item.itemId] = el.id;
						C.BlockDataviewViewUpdate(rootId, blockId, view.id, view);
					};
					close();
				}
			}
		});
	};

	onOver (e: any, item: any) {
		if (!keyboard.isMouseDisabled) {
			this.setActive(item, false);
		};
	};

};

export default MenuDataviewDate;