import { observable, action, set, intercept, decorate } from 'mobx';
import { I } from 'ts/lib';

const Constant = require('json/constant.json');
const DEFAULT_KEYS = [ 'id', 'name', 'description', 'iconEmoji', 'iconImage', 'type', 'layout', 'isHidden', 'done' ];

interface Detail {
	relationKey: string;
	value: any;
};

class DetailStore {

	public map: Map<string, Map<string, Detail[]>> = new Map();

	@action
	set (rootId: string, details: any[]) {
		let map = this.map.get(rootId);

		if (!map) {
			map = observable.map(new Map());
		};

		for (let item of details) {
			const list: Detail[] = [];
			for (let k in item.details) {
				const el = { relationKey: k, value: item.details[k] };
				decorate(el, { value: observable });

				intercept(el as any, (change: any) => { 
					return (change.newValue === el[change.name] ? null : change); 
				});

				list.push(el);
			};
			map.set(item.id, list);
		};

		this.map.set(rootId, map);
	};

	@action
	update (rootId: string, item: any, clear: boolean) {
		if (!item.id || !item.details) {
			return;
		};

		let map = this.map.get(rootId);
		let createMap = false;
		let createList = false;

		if (!map) {
			map = observable.map(new Map());
			createMap = true;
		} else 
		if (clear) {
			map.delete(item.id);
		};

		let list = map.get(item.id);
		if (!list) {
			list = [];
			createList = true;
		};

		for (let k in item.details) {
			let el = list.find((it: Detail) => { return it.relationKey == k; });
			if (el) {
				set(el, { value: item.details[k] });
			} else {
				el = { relationKey: k, value: item.details[k] };
				decorate(el, { value: observable });

				intercept(el as any, (change: any) => { 
					return (change.newValue === el[change.name] ? null : change); 
				});

				list.push(el);
			};
			if (createList) {
				map.set(item.id, list);
			};
		};

		if (createMap) {
			this.map.set(rootId, map);
		};
	};

	@action 
	delete (rootId: string, id: string, keys: string[]) {
		const map = this.map.get(rootId);
		if (!map) {
			return;
		};

		let list = map.get(id);
		if (!list) {
			return;
		};

		list = list.filter((it: Detail) => { return keys.indexOf(it.relationKey) < 0 });
		map.set(id, list);
	};

	get (rootId: string, id: string, keys?: string[]): any {
		let map = this.map.get(rootId) || new Map();
		let list = map.get(id) || [];

		if (!list.length) {
			return { _objectEmpty_: true };
		};
		
		let object: any = {};

		if (keys) {
			keys = keys.concat(DEFAULT_KEYS);
			list = list.filter((it: Detail) => { return keys.indexOf(it.relationKey) >= 0; });
		};

		for (let item of list) {
			object[item.relationKey] = item.value;
		};

		return {
			...object,
			id: id,
			name: String(object.name || Constant.default.name || ''),
			layout: Number(object.layout) || I.ObjectLayout.Page,
			layoutAlign: Number(object.layoutAlign) || I.BlockAlign.Left,
		};
	};

	clear (rootId: string) {
		this.map.delete(rootId);
	};

	clearAll () {
		this.map = new Map();
	};

};

export let detailStore: DetailStore = new DetailStore();
