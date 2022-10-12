import { observable, action, computed, set, makeObservable } from 'mobx';
import { I, Storage, Util } from 'Lib';
import { analytics } from 'Lib';
import { blockStore } from 'Store';

interface Preview {
	type: I.MarkType,
	param: string;
	element: any;
	range: I.TextRange;
	marks: I.Mark[];
	noUnlink?: boolean;
	onChange?(marks: I.Mark[]): void;
};

interface Filter {
	from: number;
	text: string;
};

interface Cover {
	id: string;
	image: string;
	type: I.CoverType;
};

interface Toast {
	objectId: string;
	targetId: string;
	action: string;
	objectsLength?: number;
	noButtons?: boolean;
	noUndo?: boolean;
	noOpen?: boolean;
	undo?(): void;
}

const Constant = require('json/constant.json');
const $ = require('jquery');

class CommonStore {

    public coverObj: Cover = { id: '', type: 0, image: '' };
    public progressObj: I.Progress = null;
    public filterObj: Filter = { from: 0, text: '' };
    public gatewayUrl: string = '';
    public previewObj: Preview = { type: 0, param: '', element: null, range: { from: 0, to: 0 }, marks: [] };
	public toastObj: Toast = { objectId: '', targetId: '', action: '' };
    public configObj: any = {};
    public cellId: string = '';
	public themeId: string = '';
	public nativeThemeIsDark: boolean = false;
	public typeId: string = '';
	public pinTimeId: number = 0;
	public isFullScreen: boolean = false;
	public autoSidebarValue: boolean = false;
	public redirect: string = '';
	public languages: string[] = [];
	public workspaceId: string = '';

    constructor() {
        makeObservable(this, {
            coverObj: observable,
            progressObj: observable,
            filterObj: observable,
            gatewayUrl: observable,
            previewObj: observable,
			toastObj: observable,
            configObj: observable,
			themeId: observable,
			nativeThemeIsDark: observable,
			typeId: observable,
			isFullScreen: observable,
			workspaceId: observable,
            config: computed,
            progress: computed,
            preview: computed,
			toast: computed,
            filter: computed,
            cover: computed,
            gateway: computed,
			theme: computed,
			nativeTheme: computed,
			workspace: computed,
            coverSet: action,
            gatewaySet: action,
            progressSet: action,
            progressClear: action,
            filterSetFrom: action,
            filterSetText: action,
            filterSet: action,
            previewSet: action,
			toastSet: action,
			toastClear: action,
			themeSet: action,
			nativeThemeSet: action,
			workspaceSet: action,
        });
    };

    get config(): any {
		return window.Config || { ...this.configObj, debug: this.configObj.debug || {} };
	};

    get progress(): I.Progress {
		return this.progressObj;
	};

    get preview(): Preview {
		return this.previewObj;
	};

	get toast(): Toast {
		return this.toastObj;
	};

    get filter(): Filter {
		return this.filterObj;
	};

    get cover(): Cover {
		return this.coverObj;
	};

    get gateway(): string {
		return String(this.gatewayUrl || '');
	};

	get type(): string {
		return String(this.typeId || Constant.typeId.page);
	};

	get fullscreen(): boolean {
		return this.isFullScreen;
	};

	get pinTime(): number {
		return (Number(this.pinTimeId) || Constant.default.pinTime) * 1000;
	};

	get autoSidebar(): boolean {
		return Boolean(this.autoSidebarValue);
	};

	get theme(): string {
		return String(this.themeId || '');
	};

	get nativeTheme(): string {
		return this.nativeThemeIsDark ? 'dark' : '';
	};

	get workspace(): string {
		return String(this.workspaceId || '');
	};

    coverSet (id: string, image: string, type: I.CoverType) {
		this.coverObj = { id, image, type };
	};

    coverSetDefault () {
		const cover = this.coverGetDefault();
		this.coverSet(cover.id, '', cover.type);
	};

	coverGetDefault () {
		return { id: Constant.default.cover, type: I.CoverType.Gradient };
	};

    gatewaySet (v: string) {
		this.gatewayUrl = v;
	};

    fileUrl (hash: string) {
		hash = String(hash || '');
		return this.gateway + '/file/' + hash;
	};

    imageUrl (hash: string, width: number) {
		hash = String(hash || '');
		width = Number(width) || 0;
		return `${this.gateway}/image/${hash}?width=${width}`;
	};

    progressSet (v: I.Progress) {
		this.progressObj = v;
	};

    progressClear () {
		this.progressObj = null;
	};

    filterSetFrom (from: number) {
		this.filterObj.from = from;
	};

    filterSetText (text: string) {
		this.filterObj.text = Util.filterFix(text);
	};

    filterSet (from: number, text: string) {
		this.filterSetFrom(from);
		this.filterSetText(text);
	};

    previewSet (preview: Preview) {
		this.previewObj = preview;
	};

	toastSet (toast: Toast) {
		this.toastObj = toast;
	}

	workspaceSet (id: string) {
		this.workspaceId = String(id || '');
	};

	previewClear () {
		this.previewObj = { type: 0, param: '', element: null, range: { from: 0, to: 0 }, marks: [] };
	};

	toastClear () {
		this.toastObj = { objectId: '', targetId: '', action: '' };
	};

	defaultTypeSet (v: string) {
		this.typeId = String(v || '');
		Storage.set('defaultType', this.typeId);
	};

	pinTimeSet (v: string) {
		this.pinTimeId = Number(v) || Constant.default.pinTime;
		Storage.set('pinTime', this.pinTimeId);
	};

	autoSidebarSet (v: boolean) {
		this.autoSidebarValue = Boolean(v);
		Storage.set('autoSidebar', this.autoSidebarValue);
	};

	fullscreenSet (v: boolean) {
		const body = $('body');
		
		this.isFullScreen = v;
		v ? body.addClass('isFullScreen') : body.removeClass('isFullScreen');

		$(window).trigger('resize');
	};

	themeSet (v: string) {
		this.themeId = v;
		Storage.set('theme', v);
		
		this.setThemeClass();
	};

	redirectSet (v: string) {
		this.redirect = v;
	};

	getThemeClass () {
		if (this.themeId == 'system') {
			return this.nativeThemeIsDark ? 'dark' : '';
		} else {
			return this.themeId;
		};
	};

	setThemeClass() {
		Util.addBodyClass('theme', this.getThemeClass());
	};

	nativeThemeSet (isDark: boolean) {
		console.log('[nativeThemeSet]', isDark);
		this.nativeThemeIsDark = isDark;
	};

	languagesSet (v: string[]) {
		this.languages = v;
	};

	infoSet (info: I.AccountInfo) {
		console.log('[commonStore.infoSet]', info);

		blockStore.rootSet(info.homeObjectId);
		blockStore.profileSet(info.profileObjectId);

		blockStore.storeSetType(info.marketplaceTypeObjectId);
		blockStore.storeSetTemplate(info.marketplaceTemplateObjectId);
		blockStore.storeSetRelation(info.marketplaceRelationObjectId);

		this.gatewaySet(info.gatewayUrl);

		analytics.device(info.deviceId);
	};

	configSet (config: any, force: boolean) {
		console.log('[commonStore.configSet]', config, force);

		let obj = $('html');
		let newConfig: any = {};

		if (force) {
			newConfig = config;
		} else {
			for (let k in config) {
				if (undefined === this.configObj[k]) {
					newConfig[k] = config[k];
				};
			};
		};

		set(this.configObj, newConfig);

		this.configObj.debug = this.configObj.debug || {};
		this.configObj.debug.ui ? obj.addClass('debug') : obj.removeClass('debug');
	};

};

export let commonStore: CommonStore = new CommonStore();