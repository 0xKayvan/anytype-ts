import { observable, action, computed, set, makeObservable } from 'mobx';
import { I, Storage, Util } from 'ts/lib';

const Constant = require('json/constant.json');

interface LinkPreview {
	url: string;
	element: any;
	rootId: string;
	blockId: string;
	range: I.TextRange;
	marks: I.Mark[];
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

class CommonStore {

    public coverObj: Cover = { id: '', type: 0, image: '' };
    public coverImg: string = '';
    public progressObj: I.Progress = null;
    public filterObj: Filter = { from: 0, text: '' };
    public gatewayUrl: string = '';
    public linkPreviewObj: LinkPreview = null;
    public configObj:any = {};
    public cellId: string = '';

    constructor() {
        makeObservable(this, {
            coverObj: observable,
            coverImg: observable,
            progressObj: observable,
            filterObj: observable,
            gatewayUrl: observable,
            linkPreviewObj: observable,
            configObj: observable,
            config: computed,
            progress: computed,
            linkPreview: computed,
            filter: computed,
            cover: computed,
            coverImage: computed,
            gateway: computed,
            coverSet: action,
            coverSetUploadedImage: action,
            gatewaySet: action,
            progressSet: action,
            progressClear: action,
            filterSetFrom: action,
            filterSetText: action,
            filterSet: action,
            linkPreviewSet: action
        });
    };

    get config(): any {
		return { ...this.configObj, debug: this.configObj.debug || {} };
	};

    get progress(): I.Progress {
		return this.progressObj;
	};

    get linkPreview(): LinkPreview {
		return this.linkPreviewObj;
	};

    get filter(): Filter {
		return this.filterObj;
	};

    get cover(): Cover {
		return this.coverObj;
	};

    get coverImage(): Cover {
		return this.coverImg || Storage.get('coverImg');
	};

    get gateway(): string {
		return String(this.gatewayUrl || Storage.get('gateway') || '');
	};

    coverSet (id: string, image: string, type: I.CoverType) {
		this.coverObj = { id: id, image: image, type: type };
		Storage.set('cover', this.coverObj);
	};

    coverSetUploadedImage (image: string) {
		this.coverImg = image;
		Storage.set('coverImg', this.coverImg);
	};

    coverSetDefault () {
		this.coverSet('c' + Constant.default.cover, '', I.CoverType.Image);
	};

    gatewaySet (v: string) {
		this.gatewayUrl = v;
		Storage.set('gateway', v);
	};

    fileUrl (hash: string) {
		hash = String(hash || '');
		return this.gateway + '/file/' + hash;
	};

    imageUrl (hash: string, width: number) {
		hash = String(hash || '');
		width = Number(width) || 0;
		return this.gateway + '/image/' + hash + '?width=' + width;
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

    linkPreviewSet (param: LinkPreview) {
		this.linkPreviewObj = param;
	};

    configSet (config: any) {
		this.configObj = config;
	};

};

export let commonStore: CommonStore = new CommonStore();