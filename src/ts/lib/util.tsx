import { I, keyboard } from 'ts/lib';
import { commonStore, popupStore } from 'ts/store';
import { v4 as uuidv4 } from 'uuid';
import { translate } from '.';

const escapeStringRegexp = require('escape-string-regexp');
const { ipcRenderer } = window.require('electron');
const { process } = window.require('electron').remote;
const raf = require('raf');
const $ = require('jquery');
const loadImage = require('blueimp-load-image');
const fs = window.require('fs');
const readChunk = window.require('read-chunk');
const fileType = window.require('file-type');
const Constant = require('json/constant.json');
const Errors = require('json/error.json');
const os = window.require('os');
const sprintf = require('sprintf-kit')({
	d: require('sprintf-kit/modifiers/d'),
	s: require('sprintf-kit/modifiers/s'),
	f: require('sprintf-kit/modifiers/f'),
});

class Util {
	
	timeoutTooltip: number = 0;
	timeoutLinkPreviewShow: number = 0;
	timeoutLinkPreviewHide: number = 0;
	linkPreviewOpen: boolean = false;
	
	sprintf (...args: any[]) {
		return sprintf.apply(this, args);
	};
	
	toUpperCamelCase (str: string) {
		return this.toCamelCase('_' + str);
	};
	
	toCamelCase (str: string) {
		return str.replace(/[_\-\s]([a-zA-Z]{1})/g, (s: string, p1: string) => {
			return String(p1 || '').toUpperCase();
		});
	};

	fromCamelCase (str: string, symbol: string) {
		return str.replace(/([A-Z]{1})/g, (str: string, p1: string, p2: string, offset: number, s: string) => {
			return symbol + p1.toLowerCase();
		});
	};

	ucFirst (s: string): string {
		if (!s) {
			return '';
		};
		return s.substr(0, 1).toUpperCase() + s.substr(1, s.length).toLowerCase();
	};
	
	objectCopy (o: any): any {
		return JSON.parse(JSON.stringify(o || {}));
	};
	
	objectLength (o: any) {
		return o.hasOwnProperty('length') ? o.length : Object.keys(o).length;
	};

	// Clear object for smaller console output
	objectClear (o: any) {
		for (let k in o) {
			if ('object' == typeof(o[k])) {
				o[k] = this.objectClear(o[k]);
				if (!this.objectLength(o[k])) {
					delete(o[k]);
				} else 
				if (o[k].hasOwnProperty('fieldsMap')){
					o[k] = this.fieldsMap(o[k]['fieldsMap']);
				};
			} else 
			if (!o[k]) {
				delete(o[k]);
			};
		};
		return o;
	};

	fieldsMap (a: any[]) {
		let o = {};
		for (let i = 0; i < a.length; ++i) {
			if ((a[i].constructor === Array) && (a[i].length == 2)) {
				let value = a[i][1];
				let v = '';

				for (let k in value) {
					if (value[k]) {
						v = value[k];
						break;
					};
				};

				o[a[i][0]] = v;
			};
		};
		if ((a.length) <= 3) {
			return JSON.stringify(o);
		};
		return o;
	};

	objectCompare (o1: any, o2: any): boolean {
		o1 = o1 || {};
		o2 = o2 || {};
		
		let k1 = Object.keys(o1);
		let k2 = Object.keys(o2);
		let v1 = Object.values(o1);
		let v2 = Object.values(o2);
		let sort = (c1: any, c2: any) => {
			if (c1 > c2) return 1;
			if (c1 < c2) return -1;
			return 0;
		};
		
		k1.sort(sort);
		k2.sort(sort);
		v1.sort(sort);
		v2.sort(sort);
		
		return (JSON.stringify(k1) === JSON.stringify(k2)) && 
			(JSON.stringify(v1) === JSON.stringify(v2));
	};

	arrayUnique (a: any[]) {
		return [ ...new Set(a) ];
	};
	
	arrayUniqueObjects (a: any[], k: string) {
		const res: any[] = [];
		const map = new Map();
		
		for (const item of a) {
			if (!map.has(item[k])){
				map.set(item[k], true);
				res.push(item);
			};
		};
		return res;
	};

	arrayValues (a: any) {
		return a.hasOwnProperty('length') ? a : Object.values(a);
	};

	stringCut (haystack: string, start: number, end: number): string {
		return String(haystack || '').substr(0, start) + haystack.substr(end);
	};

	stringInsert (haystack: string, needle: string, start: number, end: number): string {
		haystack = String(haystack || '');
		return haystack.substr(0, start) + needle + haystack.substr(end);
	};
	
	shorten (s: string, l: number, noEnding?: boolean) {
		s = String(s || '');
		l = Number(l) || 16;
		if (s.length > l) {
			s = s.substr(0, l) + (!noEnding ? '...' : '');
		};
		return s;
	};

	rectsCollide (rect1: any, rect2: any) {
		return this.coordsCollide(rect1.x, rect1.y, rect1.width, rect1.height, rect2.x, rect2.y, rect2.width, rect2.height);
	};
	
	coordsCollide (x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number) {
		return !((y1 + h1 < y2) || (y1 > y2 + h2) || (x1 + w1 < x2) || (x1 > x2 + w2));
	};
	
	clipboardCopy (data: any, callBack?: () => void) {
		const handler = (e: any) => {
			e.preventDefault();
			
			if (data.text) {
				e.clipboardData.setData('text/plain', data.text);
			};
			if (data.html) {
				e.clipboardData.setData('text/html', data.html);	
			};
			if (data.anytype) {
				e.clipboardData.setData('application/json', JSON.stringify(data.anytype));
			};
			
			document.removeEventListener('copy', handler, true);
			
			if (callBack) {
				callBack();
			};
		};

		document.addEventListener('copy', handler, true);
		document.execCommand('copy');
	};
	
	makeFileFromPath (path: string) {
		let fn = path.split('/');
		let stat = fs.statSync(path);
		let buffer = readChunk.sync(path, 0, stat.size);
		let type = fileType(buffer);
		let file = new File([ new Blob([ buffer ]) ], fn[fn.length - 1], { type: type.mime });
		return file;
	};

	cacheImages (images: string[], callBack?: () => void) {
		let loaded = 0;
		let cb = () => {
			loaded++;
			if ((loaded == images.length) && callBack) {
				callBack();
			};
		};

		images.forEach(image => {
			const img = new Image();

			img.src = image;
			img.onload = cb;
			img.onerror = cb;
		});
	};
	
	loadPreviewCanvas (file: any, param: any, success?: (canvas: any) => void) {
		if (!file) {
			return;
		};
		
		param = Object.assign({
			maxWidth: 256,
			type: 'image/png',
			quality: 0.95,
			canvas: true,
			contain: true
		}, param);
		
		loadImage.parseMetaData(file, (data: any) => {
			if (data.exif) {
				param = Object.assign(param, { orientation: data.exif.get('Orientation') });
			};
			
			loadImage(file, success, param);
		});
	};
	
	loadPreviewBlob (file: any, param: any, success?: (image: any, param: any) => void, error?: (error: string) => void) {
		this.loadPreviewCanvas(file, param, (canvas: any) => {
			canvas.toBlob((blob: any) => {
				if (blob && success) {
					success(blob, { width: canvas.width, height: canvas.height });
				};
				
				if (!blob && error) {
					error('Failed to get canvas.toBlob()');
				};
			}, param.type, param.quality);
		});
	};
	
	loadPreviewBase64 (file: any, param: any, success?: (image: string, param: any) => void, error?: (error: string) => void) {
		this.loadPreviewCanvas(file, param, (canvas: any) => {
			let image = canvas.toDataURL(param.type, param.quality);
			
			if (image && success) {
				success(image, { width: canvas.width, height: canvas.height });
			};
			
			if (!image && error) {
				error('Failed to get canvas.toDataURL()');
			};
		});
	};
	
	rand (min: number, max: number): number {
		if (max && (max != min)) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		} else {
			return Math.floor(Math.random() * (min + 1));
		};
	};

	time () {
		return Math.floor((new Date()).getTime() / 1000);
	};

	timestamp (y: number, m: number, d: number, h?: number, i?: number, s?: number): number {
		y = Number(y) || 0;
		m = Number(m) || 0;
		d = Number(d) || 0;
		h = Number(h) || 0;
		i = Number(i) || 0;
		s = Number(s) || 0;
		return Math.floor(Date.UTC(y, m - 1, d, h, i, s, 0) / 1000);
	};

	parseDate (value: string): number {
		let [ date, time ] = String(value || '').split(' ');
		let [ d, m, y ] = String(date || '').split('.').map((it: any) => { return Number(it) || 0; });
		let [ h, i, s ] = String(time || '').split(':').map((it: any) => { return Number(it) || 0; });

		m = Math.min(12, Math.max(1, m));
		let maxDays = Constant.monthDays[m];
		if ((m == 2) && (y % 4 === 0)) {
			maxDays = 29;
		};
		d = Math.min(maxDays, Math.max(1, d));
		h = Math.min(24, Math.max(0, h));
		i = Math.min(60, Math.max(0, i));
		s = Math.min(60, Math.max(0, s));

		return this.timestamp(y, m, d, h, i, s);
	};

	date (format: string, timestamp: number, local?: boolean) {
		timestamp = Number(timestamp) || 0;
		const d = new Date(timestamp ? timestamp * 1000 : null);
		const fn = local ? '' : 'UTC';

		const pad = (n: number, c: number) => {
			let s = String(n);
			if ((s = s + '').length < c ) {
				++c;
				let m = c - s.length;
				return new Array(m).join('0') + s;
			} else {
				return s;
			};
		};

		const f: any = {
			// Day
			d: () => {
			   return pad(f.j(), 2);
			},
			D: () => {
				let t = f.l(); 
				return t.substr(0,3);
			},
			j: () => {
				return d[`get${fn}Date`]();
			},
			// Month
			F: () => {
				return translate('month' + f.n());
			},
			m: () => {
				return pad(f.n(), 2);
			},
			M: () => {
				return f.F().substr(0, 3);
			},
			n: () => {
				return d[`get${fn}Month`]() + 1;
			},
			// Year
			Y: () => {
				return d[`get${fn}FullYear`]();
			},
			y: () => {
				return (d[`get${fn}FullYear`]() + '').slice(2);
			},
			// Time
			a: () => {
				return d[`get${fn}Hours`]() > 11 ? 'pm' : 'am';
			},
			A: () => {
				return d[`get${fn}Hours`]() > 11 ? 'PM' : 'AM';
			},
			g: () => {
				return d[`get${fn}Hours`]() % 12 || 12;
			},
			h: () => {
				return pad(f.g(), 2);
			},
			H: () => {
				return pad(d[`get${fn}Hours`](), 2);
			},
			i: () => {
				return pad(d[`get${fn}Minutes`](), 2);
			},
			s: () => {
				return pad(d[`get${fn}Seconds`](), 2);
			},
			w: () => {
				return d[`get${fn}Day`]();
			},
		};
		return format.replace(/[\\]?([a-zA-Z])/g, (t: string, s: string) => {
			let ret = null;
			if (t != s) {
				ret = s;
			} else if (f[s]) {
				ret = f[s]();
			} else {
				ret = s;
			};
			return ret;
		});
	};

	timeAgo (t: number): string {
		if (!t) {
			return '';
		};

		let delta = this.time() - t;
		let d = Math.floor(delta / 86400);

		delta -= d * 86400;
		let h = Math.floor(delta / 3600);

		delta -= h * 3600;
		let m = Math.floor(delta / 60);

		delta -= m * 60;
		let s = delta;

		if (d > 0) {
			return sprintf('%d days ago', d);
		};
		if (h > 0) {
			return sprintf('%d hours ago', h);
		};
		if (m > 0) {
			return sprintf('%d minutes ago', m);
		};
		if (s > 0) {
			return sprintf('%d seconds ago', s);
		};
		return '';
	};
	
	round (v: number, l: number) {
		let d = Math.pow(10, l);
		return d > 0 ? Math.round(v * d) / d : Math.round(v);
	};
	
	fileSize (v: number) {
		v = Number(v) || 0;
		let g = v / (1024 * 1024 * 1024);
		let m = v / (1024 * 1024);
		let k = v / 1024;
		if (g > 1) {
			v = sprintf('%fGB', this.round(g, 2));
		} else if (m > 1) {
			v = sprintf('%fMB', this.round(m, 2));
		} else if (k > 1) {
			v = sprintf('%fKB', this.round(k, 2));
		} else {
			v = sprintf('%dB', this.round(v, 0));
		};
		return v;
	};

	fileIcon (obj: any): string {
		const n = obj.name.split('.');
		const mime = String(obj.mime || obj.mimeType || obj.fileMimeType || '');
		const e = String(obj.fileExt || n[n.length - 1] || '');

		let t: string[] = [];
		let icon = '';

		if (mime) {
			let a: string[] = mime.split(';');
			if (a.length) {
				t = a[0].split('/');
			};
		};

		if ([ 'm4v' ].indexOf(e) >= 0) {
			icon = 'video';
		};
			
		if ([ 'csv', 'json', 'txt', 'doc', 'docx' ].indexOf(e) >= 0) {
			icon = 'text';
		};
			
		if ([ 'zip', 'gzip', 'tar', 'gz', 'rar' ].indexOf(e) >= 0) {
			icon = 'archive';
		};

		if ([ 'xls', 'xlsx' ].indexOf(e) >= 0) {
			icon = 'table';
		};
		
		if (t.length) {
			if ([ 'image', 'video', 'text', 'audio' ].indexOf(t[0]) >= 0) {
				icon = t[0];
			};
			
			if ([ 'pdf' ].indexOf(t[1]) >= 0) {
				icon = t[1];
			};
			
			if ([ 'zip', 'gzip', 'tar', 'gz', 'rar' ].indexOf(t[1]) >= 0) {
				icon = 'archive';
			};
			
			if ([ 'vnd.ms-powerpoint' ].indexOf(t[1]) >= 0) {
				icon = 'presentation';
			};
			
			if ([ 'vnd.openxmlformats-officedocument.spreadsheetml.sheet' ].indexOf(t[1]) >= 0) {
				icon = 'table';
			};
		};

		return String(icon || 'other');
	};
	
	scrollTop (top: number) {
		$('html, body').stop().animate({ scrollTop: top }, 300, 'swing');	
	};
		
	scrollTopEnd () {
		this.scrollTop($(document).height() - $(window).height());
	};
	
	tooltipShow (text: string, node: any, typeY: I.MenuDirection) {
		if (!node.length || keyboard.isResizing) {
			return;
		};

		window.clearTimeout(this.timeoutTooltip);
		this.timeoutTooltip = window.setTimeout(() => {
			let win = $(window);
			let obj = $('#tooltip');
			let offset = node.offset();
			let st = win.scrollTop(); 

			text = text.toString().replace(/\\n/, '\n');
			
			obj.find('.txt').html(this.lbBr(text));
			obj.show().css({ opacity: 0 });
			
			let x = offset.left - obj.outerWidth() / 2 + node.outerWidth() / 2;
			let y = 0;
			
			if (typeY == I.MenuDirection.Top) {
				y = offset.top - obj.outerHeight() - 6 - st;
			};
			
			if (typeY == I.MenuDirection.Bottom) {
				y = offset.top + node.outerHeight() + 6 - st;
			};

			x = Math.max(12, x);
			x = Math.min(win.width() - obj.outerWidth() - 12, x);

			raf(() => {
				obj.css({ left: x, top: y, opacity: 1 });
			});
		}, 250);
	};
	
	tooltipHide (force: boolean) {
		let obj = $('#tooltip');
		
		obj.css({ opacity: 0 });
		window.clearTimeout(this.timeoutTooltip);
		this.timeoutTooltip = window.setTimeout(() => { obj.hide(); }, force ? 0 : Constant.delay.tooltip);
	};
	
	linkPreviewShow (url: string, node: any, param: any) {
		if (!node.length || keyboard.isPreviewDisabled) {
			return;
		};
		
		const obj = $('#linkPreview');
		
		node.unbind('mouseleave.link').on('mouseleave.link', (e: any) => {
			window.clearTimeout(this.timeoutLinkPreviewShow);
		});
		
		obj.unbind('mouseleave.link').on('mouseleave.link', (e: any) => {
			this.linkPreviewHide(false);
		});
		
		this.linkPreviewHide(false);
		
		window.clearTimeout(this.timeoutLinkPreviewShow);
		this.timeoutLinkPreviewShow = window.setTimeout(() => {
			commonStore.linkPreviewSet({
				url: url,
				element: node,
				...param,
			});
			this.linkPreviewOpen = true;
		}, 500);
	};
	
	linkPreviewHide (force: boolean) {
		if (!this.linkPreviewOpen) {
			return;
		};

		const obj = $('#linkPreview');
		
		window.clearTimeout(this.timeoutLinkPreviewShow);
		
		if (force) {
			obj.hide();
			return;
		};
		
		obj.css({ opacity: 0 });
		this.timeoutLinkPreviewHide = window.setTimeout(() => { 
			obj.hide();
			this.linkPreviewOpen = false;
			obj.removeClass('top bottom withImage'); 
		}, 250);
	};
	
	lbBr (s: string) {
		return s.toString().replace(new RegExp(/\n+/gi), '<br/>');
	};
	
	map (list: any[], field: string): any {
		list = list|| [] as any[];
		
		let map = {} as any;
		for (let item of list) {
			map[item[field]] = map[item[field]] || [];
			map[item[field]].push(item);
		};
		return map;
	};
	
	unmap (map: any) {
		let ret: any[] = [] as any[];
		for (let field in map) {
			ret = ret.concat(map[field]);
		};
		return ret;
	};
	
	filterFix (v: string) {
		return escapeStringRegexp(String(v || ''));
	};
	
	lengthFixOut (text: string, len: number): number {
		const s = String(text || '').substring(0, len);
		return [...s].length;
	};
	
	rangeFixOut (text: string, range: I.TextRange): I.TextRange {
		range = this.objectCopy(range);
		range.from = this.lengthFixOut(text, range.from);
		range.to = this.lengthFixOut(text, range.to);
		return range;
	};
	
	renderLink (obj: any) {
		obj.find('a').unbind('click').on('click', function (e: any) {
			e.preventDefault();
			ipcRenderer.send('urlOpen', $(this).attr('href'));
		});
	};
	
	emailCheck (v: string) {
		return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,5})+$/.test(String(v || ''));
	};

	isNumber (s: string) {
		return String((Number(s) || 0) || '') === String(s || '');
	};

	coverSrc (cover: string, preview?: boolean) {
		return `./img/cover/${preview ? 'preview/' : ''}${cover}.jpg`;
	};

	selectionRect () {
		let sel: Selection = window.getSelection();
		let rect: any = { x: 0, y: 0, width: 0, height: 0 };
		let range: Range = null;

		if (sel && (sel.rangeCount > 0)) {
			range = sel.getRangeAt(0);
			rect = range.getBoundingClientRect() as DOMRect;
		};
		return this.objectCopy(rect);
	};

	cntWord (cnt: any, w1: string, w2?: string) {
		return String(cnt || '').substr(-1) == '1' ? w1 : (w2 ? w2 : w1 + 's');
	};

	uuid () {
		return uuidv4(); 
	};
	
	getPlatform () {
		return Constant.platforms[os.platform()];
	};

	checkError (code: number) {
		if (!code) {
			return;
		};

		// App is already working
		if (code == Errors.Code.ANOTHER_ANYTYPE_PROCESS_IS_RUNNING) {
			alert('You have another instance of anytype running on this machine. Closing...');
			ipcRenderer.send('exit', false);
		};

		// App needs update
		if (code == Errors.Code.ANYTYPE_NEEDS_UPGRADE) {
			this.onErrorUpdate();
		};
	};

	onErrorUpdate (onConfirm?: () => void) {
		popupStore.open('confirm', {
			data: {
				icon: 'update',
				title: translate('confirmUpdateTitle'),
				text: translate('confirmUpdateText'),
				textConfirm: translate('confirmUpdateConfirm'),
				canCancel: false,
				onConfirm: () => {
					ipcRenderer.send('update');
					if (onConfirm) {
						onConfirm();
					};
				},
			},
		});
	};

	getRoute (path: string) {
		let route = path.split('/');
		route.shift();

		let page = route[0] ? route[0] : 'index';
		let action = route[1] ? route[1] : 'index';

		return { page, action };
	};

	intercept (obj: any, change: any) {
		return JSON.stringify(change.newValue) === JSON.stringify(obj[change.name]) ? null : change;
	};

	getEditorScrollContainer (type: string) {
		switch (type) {
			default:
			case 'page':
				return 'body';

			case 'popup':
				return '#popupPage #innerWrap';
			
			case 'menuBlockRelationList':
			case 'menuBlockRelationView':
				return `#${type} .content`;
		};
	};

	getEditorPageContainer (type: string) {
		switch (type) {
			default:
			case 'page':
				return 'body';

			case 'popup':
				return '#popupPage';

			case 'menuBlockRelationList':
			case 'menuBlockRelationView':
				return '#' + type;
		};
	};

	dateForFile () {
		return new Date().toISOString().replace(/:/g, '_').replace(/\..+/, '');
	};

	ctrlSymbol () {
		const platform = this.getPlatform();
		return platform == I.Platform.Mac ? '&#8984;' : 'Ctrl';
	};

	sizeHeader (): number {
		const platform = this.getPlatform();
		const version = process.getSystemVersion();
		
		let a = version.split('.');
		let v = a.length ? a[0] : '';

		let s = 38;
		if (platform == I.Platform.Windows) {
			s = 68;
		};
		if ((platform == I.Platform.Mac) && (v == '11')) {
			s = 52;
		};
		return s;
	};

};

export default new Util();