import { observable, action, set, intercept, makeObservable } from 'mobx';
import { I, Relation, DataUtil, translate } from 'Lib';
import { dbStore } from 'Store';

import Constant from 'json/constant.json';

interface Detail {
	relationKey: string;
	value: any;
};

class DetailStore {

    public map: Map<string, Map<string, Detail[]>> = new Map();

    constructor() {
        makeObservable(this, {
            set: action,
            update: action,
            delete: action
        });
    };

    set (rootId: string, details: any[]) {
		let map = this.map.get(rootId);

		if (!map) {
			map = observable.map(new Map());
		};

		for (let item of details) {
			const list: Detail[] = [];
			for (let k in item.details) {
				const el = { relationKey: k, value: item.details[k] };
				makeObservable(el, { value: observable });

				intercept(el as any, (change: any) => { 
					return (change.newValue === el[change.name] ? null : change); 
				});

				list.push(el);
			};
			map.set(item.id, list);
		};

		this.map.set(rootId, map);
	};

    update (rootId: string, item: any, clear: boolean) {
		if (!item || !item.id || !item.details) {
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
			let el = list.find(it => it.relationKey == k);
			if (el) {
				set(el, { value: item.details[k] });
			} else {
				el = { relationKey: k, value: item.details[k] };
				makeObservable(el, { value: observable });
				list.push(el);
			};

			intercept(el as any, (change: any) => { 
				return (change.newValue === el[change.name] ? null : change); 
			});

			if (createList) {
				map.set(item.id, list);
			};
		};

		if (createMap) {
			this.map.set(rootId, map);
		};
	};

    delete (rootId: string, id: string, keys: string[]) {
		let map = this.map.get(rootId) || new Map();
		let list = this.getArray(rootId, id);

		list = list.filter(it => !keys.includes(it.relationKey));
		map.set(id, list);
	};

	getArray (rootId: string, id: string): any[] {
		let map = this.map.get(rootId) || new Map();
		return map.get(id) || [];
	};

    get (rootId: string, id: string, keys?: string[], forceKeys?: boolean): any {
		let list = this.getArray(rootId, id);
		if (!list.length) {
			return { id, _empty_: true };
		};
		
		if (keys) {
			keys.push('id');
			if (!forceKeys) {
				keys = keys.concat(Constant.defaultRelationKeys);
			};
			list = list.filter(it => keys.includes(it.relationKey));
		};
		return this.check(Object.fromEntries(list.map(it => [ it.relationKey, it.value ])));
	};

	check (object: any) {
		let layout = Number(object.layout) || I.ObjectLayout.Page;
		let name = String(object.name || DataUtil.defaultName('page'));
		let snippet = Relation.getStringValue(object.snippet).replace(/\n/g, ' ');

		if (layout == I.ObjectLayout.Note) {
			object.coverType = I.CoverType.None;
			object.coverId = '';
			object.iconEmoji = '';
			object.iconImage = '';

			name = snippet;
		};

		if (object.isDeleted) {
			name = translate('commonDeletedObject');
		};

		if (object.type == Constant.typeId.type) {
			object.smartblockTypes = Relation.getArrayValue(object.smartblockTypes);
			object.recommendedLayout = Number(object.recommendedLayout) || I.ObjectLayout.Page;
			object.recommendedRelations = Relation.getArrayValue(object.recommendedRelations);

			if (object.isDeleted) {
				name = translate('commonDeletedType');
			};
		} else
		if (object.type == Constant.typeId.relation) {
			object.relationFormat = Number(object.relationFormat) || I.RelationType.LongText;
			object.format = object.relationFormat;
			object.maxCount = Number(object.relationMaxCount) || 0;
			object.objectTypes = Relation.getArrayValue(object.relationFormatObjectTypes);
			object.isReadonlyRelation = Boolean(object.isReadonly);
			object.isReadonlyValue = Boolean(object.relationReadonlyValue);

			delete(object.relationMaxCount);
			delete(object.isReadonly);
			delete(object.relationReadonlyValue);
		} else
		if (object.type == Constant.typeId.option) {
			object.text = Relation.getStringValue(object.name);
			object.color = Relation.getStringValue(object.relationOptionColor);

			delete(object.relationOptionColor);
		};

		return {
			...object,
			name,
			layout,
			snippet,
			type: Relation.getStringValue(object.type),
			iconImage: Relation.getStringValue(object.iconImage),
			iconEmoji: Relation.getStringValue(object.iconEmoji),
			layoutAlign: Number(object.layoutAlign) || I.BlockHAlign.Left,
			coverX: Number(object.coverX) || 0,
			coverY: Number(object.coverY) || 0,
			coverScale: Number(object.coverScale) || 0,
			coverType: Number(object.coverType) || I.CoverType.None,
			isArchived: Boolean(object.isArchived),
			isFavorite: Boolean(object.isFavorite),
			isHidden: Boolean(object.isHidden),
		};
	};

    clear (rootId: string) {
		this.map.delete(rootId);
	};

    clearAll () {
		this.map.clear();
	};
};

export let detailStore: DetailStore = new DetailStore();
