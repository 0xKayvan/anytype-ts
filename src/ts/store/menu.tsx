import { observable, action, computed, set } from 'mobx';
import { I, Storage, Util, analytics } from 'ts/lib';

const Constant = require('json/constant.json');
const $ = require('jquery');

class MenuStore {
	@observable public menuList: I.Menu[] = [];

	timeout: number = 0;
	
	@computed
	get list(): I.Menu[] {
		return this.menuList;
	};
	
	@action
	open (id: string, param: I.MenuParam) {
		if (!id) {
			return;
		};

		param.type = Number(param.type) || I.MenuType.Vertical;
		param.vertical = Number(param.vertical) || I.MenuDirection.Bottom;
		param.horizontal = Number(param.horizontal) || I.MenuDirection.Left;
		param.offsetX = Number(param.offsetX) || 0;
		param.offsetY = Number(param.offsetY) || 0;
		param.tabs = param.tabs || [];

		if (param.isSub) {
			param.noAnimation = true;
		};

		const item = this.get(id);
		if (item) {
			this.update(id, param);
		} else {
			this.menuList.push(observable({ id: id, param: param }));
		};

		analytics.event(Util.toCamelCase('Menu-' + id));
	};

	@action
	update (id: string, param: any) {
		const item = this.get(id);
		if (item) {
			set(item, { param: Object.assign(item.param, param) });
		};
	};

	@action
	updateData (id: string, data: any) {
		const item = this.get(id);
		if (item) {
			item.param.data = Object.assign(item.param.data, data);
			this.update(id, item.param);
		};
	};

	get (id: string): I.Menu {
		return this.menuList.find((item: I.Menu) => { return item.id == id; });
	};

	isOpen (id?: string, key?: string): boolean {
		if (!id) {
			return this.menuList.length > 0;
		};

		const item = this.get(id);
		if (!item) {
			return false;
		};

		return key ? (item.param.menuKey == key) : true;
	};

	isOpenList (ids: string[]) {
		for (let id of ids) {
			if (this.isOpen(id)) {
				return true;
			};
		};
		return false;
	};
	
	@action
	close (id: string, callBack?: () => void) {
		const item = this.get(id);

		if (!item) {
			if (callBack) {
				callBack();
			};
			return;
		};

		const { param } = item;
		const { noAnimation, subIds, onClose } = param;
		const el = $('#' + Util.toCamelCase('menu-' + id));
		const t = noAnimation ? 0 : Constant.delay.menu;
		const cb = () => {
			if (el.length) {
				if (noAnimation) {
					el.addClass('noAnimation');
				};
				el.css({ transform: '' }).removeClass('show');
			};

			window.setTimeout(() => {
				this.menuList = this.menuList.filter((it: I.Menu) => { return it.id != id; });
				
				if (onClose) {
					onClose();
				};
				
				if (callBack) {
					callBack();
				};
			}, t);
		};

		subIds && subIds.length ? this.closeAll(subIds, cb) : cb();
	};
	
	@action
	closeAll (ids?: string[], callBack?: () => void) {
		const items = ids && ids.length ? this.menuList.filter((it: I.Menu) => { return ids.indexOf(it.id) >= 0; }) : this.menuList;

		for (let item of items) {
			this.close(item.id);
		};

		this.clearTimeout();

		if (callBack) {
			this.timeout = window.setTimeout(() => { callBack(); }, Constant.delay.menu);
		};
	};

	clearTimeout () {
		window.clearTimeout(this.timeout);
	};
	
};

export let menuStore: MenuStore = new MenuStore();