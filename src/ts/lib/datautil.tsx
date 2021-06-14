import { I, C, M, keyboard, crumbs, translate, Util, history as historyPopup, Storage } from 'ts/lib';
import { commonStore, blockStore, detailStore, dbStore, popupStore, menuStore } from 'ts/store';

const Constant = require('json/constant.json');
const Errors = require('json/error.json');

class DataUtil {

	history: any = null;

	init (history: any) {
		this.history = history;
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
	
	unique (list: any[], field: string) {
		list = list|| [] as any[];
		
		let map = {} as any;
		for (let item of list) {
			map[item[field]] = item;
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
	
	styleIcon (type: I.BlockType, v: number): string {
		let icon = '';
		switch (type) {
			case I.BlockType.Text:
				switch (v) {
					default:
					case I.TextStyle.Paragraph:	 icon = 'text'; break;
					case I.TextStyle.Header1:	 icon = 'header1'; break;
					case I.TextStyle.Header2:	 icon = 'header2'; break;
					case I.TextStyle.Header3:	 icon = 'header3'; break;
					case I.TextStyle.Quote:		 icon = 'quote'; break;
					case I.TextStyle.Code:		 icon = 'kbd'; break;
					case I.TextStyle.Bulleted:	 icon = 'list'; break;
					case I.TextStyle.Numbered:	 icon = 'numbered'; break;
					case I.TextStyle.Toggle:	 icon = 'toggle'; break;
					case I.TextStyle.Checkbox:	 icon = 'checkbox'; break;
				};
				break;
				
			case I.BlockType.Div:
				switch (v) {
					default:
					case I.DivStyle.Line:		 icon = 'div-line'; break;
					case I.DivStyle.Dot:		 icon = 'dot'; break;
				};
				break;
		};
		return icon;
	};

	blockClass (block: any) {
		const { content } = block;
		const { style, type, state } = content;

		let c = [];
		switch (block.type) {
			case I.BlockType.Text:		 
				c.push('blockText ' + this.textClass(style)); 
				break;

			case I.BlockType.Layout:	 
				c.push('blockLayout c' + style); 
				break;

			case I.BlockType.IconPage:	 
				c.push('blockIconPage'); 
				break;

			case I.BlockType.IconUser:	 
				c.push('blockIconUser'); 
				break;
				
			case I.BlockType.File:
				if (state == I.FileState.Done) {
					c.push('withFile');
				};
				switch (type) {
					default: 
					case I.FileType.File: 
						c.push('blockFile');
						break;
						
					case I.FileType.Image: 
						c.push('blockMedia');
						break;
						
					case I.FileType.Video: 
						c.push('blockMedia');
						break;
				};
				break;
				
			case I.BlockType.Bookmark:
				c.push('blockBookmark');
				break;
			
			case I.BlockType.Dataview:
				c.push('blockDataview');
				break;
				
			case I.BlockType.Div:
				c.push('blockDiv c' + style);
				break;
				
			case I.BlockType.Link:
				c.push('blockLink');
				break;
				
			case I.BlockType.Cover:
				c.push('blockCover');
				break;

			case I.BlockType.Relation:
				c.push('blockRelation');
				break;

			case I.BlockType.Featured:
				c.push('blockFeatured');
				break;

			case I.BlockType.Type:
				c.push('blockType');
				break;
		};

		return c.join(' ');
	};

	textClass (v: I.TextStyle): string {
		let c = '';
		switch (v) {
			default:
			case I.TextStyle.Paragraph:		 c = 'paragraph'; break;
			case I.TextStyle.Header1:		 c = 'header1'; break;
			case I.TextStyle.Header2:		 c = 'header2'; break;
			case I.TextStyle.Header3:		 c = 'header3'; break;
			case I.TextStyle.Quote:			 c = 'quote'; break;
			case I.TextStyle.Code:			 c = 'code'; break;
			case I.TextStyle.Bulleted:		 c = 'bulleted'; break;
			case I.TextStyle.Numbered:		 c = 'numbered'; break;
			case I.TextStyle.Toggle:		 c = 'toggle'; break;
			case I.TextStyle.Checkbox:		 c = 'checkbox'; break;
			case I.TextStyle.Title:			 c = 'title'; break;
			case I.TextStyle.Description:	 c = 'description'; break;
		};
		return c;
	};

	layoutClass (id: string, layout: I.ObjectLayout) {
		let c = '';
		switch (layout) {
			default:
			case I.ObjectLayout.Page:		 c = 'isPage'; break;
			case I.ObjectLayout.Human:		 c = 'isHuman'; break;
			case I.ObjectLayout.Task:		 c = 'isTask'; break;
			case I.ObjectLayout.ObjectType:	 c = 'isObjectType'; break;
			case I.ObjectLayout.Relation:	 c = 'isRelation'; break;
			case I.ObjectLayout.Set:		 c = 'isSet'; break;
			case I.ObjectLayout.Image:		 c = (id ? 'isImage' : 'isFile'); break;
			case I.ObjectLayout.File:		 c = 'isFile'; break;
		};
		return c;
	};

	relationClass (v: I.RelationType): string {
		let c = '';
		switch (v) {
			default:
			case I.RelationType.LongText:	 c = 'longText'; break;
			case I.RelationType.ShortText:	 c = 'shortText'; break;
			case I.RelationType.Number:		 c = 'number'; break;
			case I.RelationType.Date:		 c = 'date'; break;
			case I.RelationType.Status:		 c = 'select isStatus'; break;
			case I.RelationType.Tag:		 c = 'select isTag'; break;
			case I.RelationType.File:		 c = 'file'; break;
			case I.RelationType.Checkbox:	 c = 'checkbox'; break;
			case I.RelationType.Url:		 c = 'url'; break;
			case I.RelationType.Email:		 c = 'email'; break;
			case I.RelationType.Phone:		 c = 'phone'; break;
			case I.RelationType.Object:		 c = 'object'; break;
		};
		return 'c-' + c;
	};

	tagClass (v: I.RelationType): string {
		let c = '';
		switch (v) {
			default:
			case I.RelationType.Status:		 c = 'isStatus'; break;
			case I.RelationType.Tag:		 c = 'isTag'; break;
		};
		return c;
	};

	dateFormat (v: I.DateFormat): string {
		let f = '';
		switch (v) {
			default:
			case I.DateFormat.MonthAbbrBeforeDay:	 f = 'M d, Y'; break;
			case I.DateFormat.MonthAbbrAfterDay:	 f = 'd M, Y'; break;
			case I.DateFormat.Short:				 f = 'd.m.Y'; break;
			case I.DateFormat.ShortUS:				 f = 'm.d.Y'; break;
			case I.DateFormat.ISO:					 f = 'Y-m-d'; break;
		};
		return f;
	};

	timeFormat (v: I.TimeFormat): string {
		let f = '';
		switch (v) {
			default:
			case I.TimeFormat.H12:	 f = 'g:i A'; break;
			case I.TimeFormat.H24:	 f = 'H:i'; break;
		};
		return f;
	};

	coverColors () {
		return [
			{ type: I.CoverType.Color, id: 'yellow' },
			{ type: I.CoverType.Color, id: 'orange' },
			{ type: I.CoverType.Color, id: 'red' },
			{ type: I.CoverType.Color, id: 'pink' },
			{ type: I.CoverType.Color, id: 'purple' },
			{ type: I.CoverType.Color, id: 'blue' },
			{ type: I.CoverType.Color, id: 'ice' },
			{ type: I.CoverType.Color, id: 'teal' },
			{ type: I.CoverType.Color, id: 'green' },
			{ type: I.CoverType.Color, id: 'lightgrey' },
			{ type: I.CoverType.Color, id: 'darkgrey' },
			{ type: I.CoverType.Color, id: 'black' },
		];
	};

	threadColor (s: I.ThreadStatus) {
		let c = '';
		switch (s) {
			case I.ThreadStatus.Failed:
			case I.ThreadStatus.Offline: c = 'red'; break;
			case I.ThreadStatus.Syncing: c = 'orange'; break;
			case I.ThreadStatus.Synced: c = 'green'; break;
		};
		return c;
	};
	
	alignIcon (v: I.BlockAlign): string {
		let icon = '';
		switch (v) {
			default:
			case I.BlockAlign.Left:		 icon = 'left'; break;
			case I.BlockAlign.Center:	 icon = 'center'; break;
			case I.BlockAlign.Right:	 icon = 'right'; break;
		};
		return icon;
	};

	filterConditionsByType (type: I.RelationType): any[] {
		let ret = [
			{ id: I.FilterCondition.None,		 name: translate('filterConditionNone') }, 
		];

		switch (type) {
			case I.RelationType.ShortText: 
			case I.RelationType.LongText: 
			case I.RelationType.Url: 
			case I.RelationType.Email: 
			case I.RelationType.Phone: 
				ret = ret.concat([ 
					{ id: I.FilterCondition.Equal,		 name: translate('filterConditionEqual') }, 
					{ id: I.FilterCondition.NotEqual,	 name: translate('filterConditionNotEqual') }, 
					{ id: I.FilterCondition.Like,		 name: translate('filterConditionLike') }, 
					{ id: I.FilterCondition.NotLike,	 name: translate('filterConditionNotLike') },
					{ id: I.FilterCondition.Empty,		 name: translate('filterConditionEmpty') }, 
					{ id: I.FilterCondition.NotEmpty,	 name: translate('filterConditionNotEmpty') },
				]);
				break;

			case I.RelationType.Object: 
			case I.RelationType.Status: 
			case I.RelationType.Tag: 
				ret = ret.concat([ 
					{ id: I.FilterCondition.In,			 name: translate('filterConditionInArray') }, 
					{ id: I.FilterCondition.AllIn,		 name: translate('filterConditionAllIn') }, 
					{ id: I.FilterCondition.Equal,		 name: translate('filterConditionEqual') },
					{ id: I.FilterCondition.NotIn,		 name: translate('filterConditionNotInArray') },
					{ id: I.FilterCondition.Empty,		 name: translate('filterConditionEmpty') }, 
					{ id: I.FilterCondition.NotEmpty,	 name: translate('filterConditionNotEmpty') },
				]);
				break;
			
			case I.RelationType.Number:
				ret = ret.concat([ 
					{ id: I.FilterCondition.Equal,			 name: '=' }, 
					{ id: I.FilterCondition.NotEqual,		 name: '≠' }, 
					{ id: I.FilterCondition.Greater,		 name: '>' }, 
					{ id: I.FilterCondition.Less,			 name: '<' }, 
					{ id: I.FilterCondition.GreaterOrEqual,	 name: '≥' }, 
					{ id: I.FilterCondition.LessOrEqual,	 name: '≤' },
					{ id: I.FilterCondition.Empty,		 name: translate('filterConditionEmpty') }, 
					{ id: I.FilterCondition.NotEmpty,	 name: translate('filterConditionNotEmpty') },
				]);
				break;

			case I.RelationType.Date:
				ret = ret.concat([ 
					{ id: I.FilterCondition.Equal,			 name: translate('filterConditionEqual') }, 
					{ id: I.FilterCondition.NotEqual,		 name: translate('filterConditionNotEqual') }, 
					{ id: I.FilterCondition.Greater,		 name: translate('filterConditionGreaterDate') }, 
					{ id: I.FilterCondition.Less,			 name: translate('filterConditionLessDate') }, 
					{ id: I.FilterCondition.GreaterOrEqual,	 name: translate('filterConditionGreaterOrEqualDate') }, 
					{ id: I.FilterCondition.LessOrEqual,	 name: translate('filterConditionLessOrEqualDate') },
					{ id: I.FilterCondition.Empty,			 name: translate('filterConditionEmpty') }, 
					{ id: I.FilterCondition.NotEmpty,		 name: translate('filterConditionNotEmpty') },
				]);
				break;
			
			case I.RelationType.Checkbox:
			default:
				ret = ret.concat([ 
					{ id: I.FilterCondition.Equal,			 name: translate('filterConditionEqual') }, 
					{ id: I.FilterCondition.NotEqual,		 name: translate('filterConditionNotEqual') },
				]);
				break;
		};
		return ret;
	};
	
	selectionGet (id: string, withChildren: boolean, props: any): string[] {
		const { dataset } = props;
		const { selection } = dataset || {};
		
		if (!selection) {
			return [];
		};
		
		let ids: string[] = selection.get(withChildren);
		if (id && ids.indexOf(id) < 0) {
			selection.clear(true);
			selection.set([ id ]);
			ids = selection.get(withChildren);
		};
		return ids;
	};
	
	pageInit (callBack?: () => void) {
		C.ConfigGet((message: any) => {
			const root = message.homeBlockId;
			const profile = message.profileBlockId;
			
			if (!root) {
				console.error('[pageInit] No root defined');
				return;
			};

			commonStore.gatewaySet(message.gatewayUrl);
			
			blockStore.rootSet(root);
			blockStore.archiveSet(message.archiveBlockId);
			blockStore.storeSetType(message.marketplaceTypeId);
			blockStore.storeSetTemplate(message.marketplaceTemplateId);
			blockStore.storeSetRelation(message.marketplaceRelationId);

			C.ObjectTypeList((message: any) => {
				dbStore.objectTypesSet(message.objectTypes);
			});
			
			if (profile) {
				C.BlockOpen(profile, (message: any) => {
					if (message.error.code == Errors.Code.ANYTYPE_NEEDS_UPGRADE) {
						Util.onErrorUpdate();
						return;
					};

					blockStore.profileSet(profile);
				});
			};

			crumbs.init();

			C.BlockOpen(root, (message: any) => {
				if (message.error.code == Errors.Code.ANYTYPE_NEEDS_UPGRADE) {
					Util.onErrorUpdate();
					return;
				};
				if (callBack) {
					callBack();
				};
			});
		});
	};

	onAuth () {
		const redirectTo = Storage.get('redirectTo');

		Storage.delete('redirect');
		Storage.delete('redirectTo');

		this.pageInit(() => {
			keyboard.initPinCheck();
			this.history.push(redirectTo ? redirectTo : '/main/index');
		});
	};

	objectOpenEvent (e: any, object: any) {
		e.preventDefault();
		e.stopPropagation();

		if (e.shiftKey || e.ctrlKey || e.metaKey || popupStore.isOpen('page')) {
			this.objectOpenPopup(object);
		} else {
			this.objectOpen(object);
		};
	};
	
	objectOpen (object: any) {
		const { root } = blockStore;

		keyboard.setSource(null);

		switch (object.layout) {
			default:
				this.history.push(object.id == root ? '/main/index' : '/main/edit/' + object.id);
				break;

			case I.ObjectLayout.Set:
				this.history.push('/main/set/' + object.id);
				break;

			case I.ObjectLayout.ObjectType:
				this.history.push('/main/type/' + object.id);
				break;

			case I.ObjectLayout.Relation:
				this.history.push('/main/relation/' + object.id);
				break;

			case I.ObjectLayout.File:
			case I.ObjectLayout.Image:
				this.history.push('/main/media/' + object.id);
				break;

			case I.ObjectLayout.Store:
				this.history.push('/main/store');
				break;
		};
	};

	objectOpenPopup (object: any) {
		const popupId = 'page';

		let action = '';

		switch (object.layout) {
			default:
				action = 'edit';
				break;

			case I.ObjectLayout.Set:
				action = 'set';
				break;

			case I.ObjectLayout.ObjectType:
				action = 'type';
				break;

			case I.ObjectLayout.Relation:
				action = 'relation';
				break;

			case I.ObjectLayout.File:
			case I.ObjectLayout.Image:
				action = 'media';
				break;

			case I.ObjectLayout.Store:
				action = 'store';
				break;
		};

		const param: any = { 
			data: { 
				matchPopup: { 
					params: {
						page: 'main',
						action: action,
						id: object.id,
					},
				},
			},
		};

		keyboard.setSource(null);
		historyPopup.pushMatch(param.data.matchPopup);
		menuStore.closeAll();

		if (popupStore.isOpen(popupId)) {
			popupStore.update(popupId, param);
		} else {
			window.setTimeout(() => { popupStore.open(popupId, param); }, Constant.delay.popup);
		};
	};
	
	pageCreate (rootId: string, targetId: string, details: any, position: I.BlockPosition, templateId: string, callBack?: (message: any) => void) {
		details = details || {};
		
		commonStore.progressSet({ status: 'Creating page...', current: 0, total: 1 });
		
		C.BlockCreatePage(rootId, targetId, details, position, templateId, (message: any) => {
			commonStore.progressSet({ status: 'Creating page...', current: 1, total: 1 });
			
			if (message.error.code) {
				return;
			};
			
			if (callBack) {
				callBack(message);
			};
		});
	};
	
	pageSetIcon (rootId: string, emoji: string, image: string, callBack?: (message: any) => void) {
		const details = [ 
			{ key: 'iconEmoji', value: emoji },
			{ key: 'iconImage', value: image },
		];
		C.BlockSetDetails(rootId, details, callBack);
	};
	
	pageSetName (rootId: string, name: string, callBack?: (message: any) => void) {
		const details = [ 
			{ key: 'name', value: name },
		];
		C.BlockSetDetails(rootId, details, callBack);
	};
	
	pageSetCover (rootId: string, type: I.CoverType, coverId: string, x?: number, y?: number, scale?: number, callBack?: (message: any) => void) {
		x = Number(x) || 0;
		y = Number(y) || 0;
		scale = Number(scale) || 0;

		const details = [ 
			{ key: 'coverType', value: type },
			{ key: 'coverId', value: coverId },
			{ key: 'coverX', value: x },
			{ key: 'coverY', value: y },
			{ key: 'coverScale', value: scale },
		];
		C.BlockSetDetails(rootId, details, callBack);
	};

	pageSetCoverXY (rootId: string, x: number, y: number, callBack?: (message: any) => void) {
		x = Number(x) || 0;
		y = Number(y) || 0;

		const details = [ 
			{ key: 'coverX', value: x },
			{ key: 'coverY', value: y },
		];
		C.BlockSetDetails(rootId, details, callBack);
	};

	pageSetCoverScale (rootId: string, scale: number, callBack?: (message: any) => void) {
		scale = Number(scale) || 0;

		const details = [ 
			{ key: 'coverScale', value: scale },
		];
		C.BlockSetDetails(rootId, details, callBack);
	};

	pageSetDone (rootId: string, done: boolean, callBack?: (message: any) => void) {
		done = Boolean(done);

		const details = [ 
			{ key: 'done', value: done },
		];
		C.BlockSetDetails(rootId, details, callBack);
	};
	
	pageSetLayout (rootId: string, layout: I.ObjectLayout, callBack?: (message: any) => void) {
		blockStore.update(rootId, { id: rootId, layout: layout });

		const details = [
			{ key: 'layout', value: layout },
		];
		C.BlockSetDetails(rootId, details, callBack);
	};

	pageSetAlign (rootId: string, align: I.BlockAlign, callBack?: (message: any) => void) {
		const details = [ 
			{ key: 'layoutAlign', value: align },
		];

		C.BlockListSetAlign(rootId, [ 
			Constant.blockId.title, 
			Constant.blockId.description, 
			Constant.blockId.featured,
		], align);

		C.BlockSetDetails(rootId, details, callBack);
	};

	blockSetText (rootId: string, block: I.Block, text: string, marks: I.Mark[], update: boolean, callBack?: (message: any) => void) {
		if (!block) {
			return;
		};
		
		if (update) {
			block.content.text = String(text || '');
			block.content.marks = marks || [];
			blockStore.update(rootId, block);
		};

		C.BlockSetTextText(rootId, block.id, text, marks, (message: any) => {
			blockStore.setNumbers(rootId);
			
			if (callBack) {
				callBack(message);
			};
		});
	};

	menuMapperBlock (it: any) {
		it.isBlock = true;
		it.name = it.lang ? translate('blockName' + it.lang) : it.name;
		it.description = it.lang ? translate('blockText' + it.lang) : it.description;
		return it;
	};
	
	menuGetBlockText () {
		return [
			{ id: I.TextStyle.Paragraph, icon: 'text', lang: 'Paragraph' },
			{ id: I.TextStyle.Header1, icon: 'header1', lang: 'Header1', aliases: [ 'h1', 'head1' ] },
			{ id: I.TextStyle.Header2, icon: 'header2', lang: 'Header2', aliases: [ 'h2', 'head2' ] },
			{ id: I.TextStyle.Header3, icon: 'header3', lang: 'Header3', aliases: [ 'h3', 'head3' ] },
			{ id: I.TextStyle.Quote, icon: 'quote', lang: 'Quote' },
		].map((it: any) => {
			it.type = I.BlockType.Text;
			return this.menuMapperBlock(it);
		});
	};
	
	menuGetBlockList () {
		return [
			{ id: I.TextStyle.Checkbox, icon: 'checkbox', lang: 'Checkbox', aliases: [ 'todo' ] },
			{ id: I.TextStyle.Bulleted, icon: 'list', lang: 'Bulleted' },
			{ id: I.TextStyle.Numbered, icon: 'numbered', lang: 'Numbered' },
			{ id: I.TextStyle.Toggle, icon: 'toggle', lang: 'Toggle' },
		].map((it: any) => {
			it.type = I.BlockType.Text;
			return this.menuMapperBlock(it);
		});
	};

	menuGetBlockMedia () {
		let ret: any[] = [
			{ type: I.BlockType.File, id: I.FileType.File, icon: 'file', lang: 'File' },
			{ type: I.BlockType.File, id: I.FileType.Image, icon: 'image', lang: 'Image' },
			{ type: I.BlockType.File, id: I.FileType.Video, icon: 'video', lang: 'Video' },
			{ type: I.BlockType.Bookmark, id: 'bookmark', icon: 'bookmark', lang: 'Bookmark' },
			{ type: I.BlockType.Text, id: I.TextStyle.Code, icon: 'code', lang: 'Code' },
		];
		return ret.map(this.menuMapperBlock);
	};

	menuGetBlockObject () {
		const { config } = commonStore;
		
		let ret: any[] = [
			{ type: I.BlockType.Page, id: 'existing', icon: 'existing', lang: 'Existing', arrow: true },
		];
		let i = 0;

		if (config.allowDataview) {
			let objectTypes = Util.objectCopy(dbStore.getObjectTypesForSBType(I.SmartBlockType.Page));
			if (!config.debug.ho) {
				objectTypes = objectTypes.filter((it: I.ObjectType) => { return !it.isHidden; })
			};

			for (let type of objectTypes) {
				ret.push({ 
					type: I.BlockType.Page, 
					id: 'object' + i++, 
					objectTypeId: type.id, 
					iconEmoji: type.iconEmoji, 
					name: type.name || Constant.default.name, 
					description: type.description,
					isObject: true,
					isHidden: type.isHidden,
				});
			};
		} else {
			ret.push({ type: I.BlockType.Page, id: 'page', icon: 'page', lang: 'Page' });
		};

		return ret.map(this.menuMapperBlock);
	};

	menuGetBlockOther () {
		return [
			{ type: I.BlockType.Div, id: I.DivStyle.Line, icon: 'div-line', lang: 'Line' },
			{ type: I.BlockType.Div, id: I.DivStyle.Dot, icon: 'dot', lang: 'Dot' },
		].map(this.menuMapperBlock);
	};

	menuGetTurnPage () {
		const { config } = commonStore;
		const ret = [];

		if (config.allowDataview) {
			let objectTypes = dbStore.objectTypes;
			
			if (!config.debug.ho) {
				objectTypes = objectTypes.filter((it: I.ObjectType) => { return !it.isHidden; });
			};

			let i = 0;
			for (let type of objectTypes) {
				ret.push({ 
					type: I.BlockType.Page, 
					id: 'object' + i++, 
					objectTypeId: type.id, 
					iconEmoji: type.iconEmoji, 
					name: type.name || Constant.default.name, 
					description: type.description,
					isObject: true,
					isHidden: type.isHidden,
				});
			};
		};

		return ret.map(this.menuMapperBlock);
	};
	
	menuGetTurnDiv () {
		return [
			{ type: I.BlockType.Div, id: I.DivStyle.Line, icon: 'div-line', lang: 'Line' },
			{ type: I.BlockType.Div, id: I.DivStyle.Dot, icon: 'dot', lang: 'Dot' },
		].map(this.menuMapperBlock);
	};
	
	// Action menu
	menuGetActions (hasFile: boolean) {
		let cmd = Util.ctrlSymbol();

		let items: any[] = [
			{ id: 'move', icon: 'move', name: 'Move to', arrow: true },
			{ id: 'copy', icon: 'copy', name: 'Duplicate', caption: `${cmd} + D` },
			{ id: 'remove', icon: 'remove', name: 'Delete', caption: 'Del' },
			//{ id: 'comment', icon: 'comment', name: 'Comment' }
		];
		
		if (hasFile) {
			items.push({ id: 'download', icon: 'download', name: 'Download' });
			//items.push({ id: 'rename', icon: 'rename', name: 'Rename' });
			//items.push({ id: 'replace', icon: 'replace', name: 'Replace' });
		};
		
		items = items.map((it: any) => {
			it.isAction = true;
			return it;
		});
		
		return items;
	};
	
	menuGetTextColors () {
		let items: any[] = [
			{ id: 'color-default', name: 'Default', value: '', className: 'default', isTextColor: true }
		];
		for (let color of Constant.textColor) {
			items.push({ id: 'color-' + color, name: translate('textColor-' + color), value: color, className: color, isTextColor: true });
		};
		return items;
	};
	
	menuGetBgColors () {
		let items: any[] = [
			{ id: 'color-default', name: 'Default', value: '', className: 'default', isBgColor: true }
		];
		for (let color of Constant.textColor) {
			items.push({ id: 'bgColor-' + color, name: translate('textColor-' + color), value: color, className: color, isBgColor: true });
		};
		return items;
	};
	
	menuGetAlign (hasQuote: boolean) {
		let ret = [
			{ id: I.BlockAlign.Left, icon: 'align left', name: 'Align left', isAlign: true },
			{ id: I.BlockAlign.Center, icon: 'align center', name: 'Align center', isAlign: true },
			{ id: I.BlockAlign.Right, icon: 'align right', name: 'Align right', isAlign: true },
		];

		if (hasQuote) {
			ret = ret.filter((it: any) => { return it.id != I.BlockAlign.Center; });
		};

		return ret;
	};

	menuGetLayouts () {
		return [
			{ id: I.ObjectLayout.Page, icon: 'page' },
			{ id: I.ObjectLayout.Human, icon: 'human' },
			{ id: I.ObjectLayout.Task, icon: 'task' },
			{ id: I.ObjectLayout.Set, icon: 'set' },
			{ id: I.ObjectLayout.File, icon: 'file' },
			{ id: I.ObjectLayout.Image, icon: 'image' },
			{ id: I.ObjectLayout.ObjectType, icon: 'type' },
			{ id: I.ObjectLayout.Relation, icon: 'relation' },
		].map((it: any) => {
			it.icon = 'layout-' + it.icon;
			it.name = translate('layout' + it.id);
			return it;
		});
	};

	menuTurnLayouts () {
		return this.menuGetLayouts().filter((it: any) => {
			return [ I.ObjectLayout.Page, I.ObjectLayout.Human, I.ObjectLayout.Task ].indexOf(it.id) >= 0;
		});
	};

	menuGetViews () {
		return [
			{ id: I.ViewType.Grid, name: 'Grid' },
			{ id: I.ViewType.Gallery, name: 'Gallery' },
			{ id: I.ViewType.List, name: 'List' },
			{ id: I.ViewType.Board, name: 'Kanban' },
		];
	};
	
	menuSectionsFilter (sections: any[], filter: string) {
		const reg = new RegExp(Util.filterFix(filter), 'gi');
		
		sections = sections.filter((s: any) => {
			if (s.name.match(reg)) {
				return true;
			};
			s.children = (s.children || []).filter((c: any) => { 
				let ret = false;
				if (c.skipFilter) {
					ret = true;
				} else 
				if (c.name && c.name.match(reg)) {
					ret = true;
					c._sortWeight_ = 100;
				} else 
				if (c.description && c.description.match(reg)) {
					ret = true;
					c._sortWeight_ = 10;
				} else
				if (c.aliases && c.aliases.length) {
					for (let alias of c.aliases) {
						if (alias.match(reg)) {
							ret = true;
							break;
						};
					};
				};
				return ret; 
			});
			s.children.sort((c1: any, c2: any) => {
				if (c1._sortWeight_ > c2._sortWeight_) return -1;
				if (c1._sortWeight_ < c2._sortWeight_) return 1;
				return 0;
			});
			return s.children.length > 0;
		});
		
		return sections;
	};
	
	menuSectionsMap (sections: any[]) {
		sections = Util.objectCopy(sections);
		sections = sections.filter((it: any) => { return it.children.length > 0; });
		sections = sections.map((s: any, i: number) => {
			s.id = s.id || i;
			s.children = s.children.map((it: any, i: number) => {
				it.itemId = it.id || i;
				it.id = s.id + '-' + it.id;
				it.color = it.color || s.color || '';
				return it;
			});
			s.children = Util.arrayUniqueObjects(s.children, 'itemId');
			return s;
		});
		sections = Util.arrayUniqueObjects(sections, 'id');
		return sections;
	};
	
	cellId (prefix: string, relationKey: string, id: any) {
		return [ prefix, relationKey, id.toString() ].join('-');
	};

	viewGetRelations (rootId: string, blockId: string, view: I.View): I.ViewRelation[] {
		const { config } = commonStore;

		if (!view) {
			return [];
		};

		let relations = Util.objectCopy(dbStore.getRelations(rootId, blockId));
		let order: any = {};
		let o = 0;

		if (!config.debug.ho) {
			relations = relations.filter((it: I.Relation) => { return !it.isHidden; });
		};

		for (let i = 0; i < view.relations.length; ++i) {
			order[view.relations[i].relationKey] = o++;
		};

		for (let i = 0; i < relations.length; ++i) {
			if (undefined === order[relations[i].relationKey]) {
				order[relations[i].relationKey] = o++;
			};
		};

		relations.sort((c1: any, c2: any) => {
			let o1 = order[c1.relationKey];
			let o2 = order[c2.relationKey];
			if (o1 > o2) return 1;
			if (o1 < o2) return -1;
			return 0;
		});

		return relations.map((relation: any) => {
			const vr = view.relations.find((it: I.Relation) => { return it.relationKey == relation.relationKey; }) || {};
			return new M.ViewRelation({
				...vr,
				relationKey: relation.relationKey,
				width: this.relationWidth(vr.width, relation.format),
			});
		});
	};

	relationWidth (width: number, format: I.RelationType): number {
		return Number(width || Constant.size.dataview.cell[this.relationClass(format)]) || Constant.size.dataview.cell.default;
	};

	dataviewRelationAdd (rootId: string, blockId: string, relation: any, view?: I.View, callBack?: (message: any) => void) {
		relation = new M.Relation(relation);

		C.BlockDataviewRelationAdd(rootId, blockId, relation, (message: any) => {
			if (message.error.code || !view) {
				return;
			};

			let rel = view.getRelation(message.relationKey);
			if (rel) {
				rel.isVisible = true;
			} else {
				relation.relationKey = message.relationKey;
				relation.isVisible = true;
				relation.width = this.relationWidth(0, relation.format);

				view.relations.push(relation);
			};

			if (callBack) {
				callBack(message);
			};

			C.BlockDataviewViewUpdate(rootId, blockId, view.id, view);
		});
	};

	dataviewRelationUpdate (rootId: string, blockId: string, relation: any, view?: I.View, callBack?: (message: any) => void) {
		C.BlockDataviewRelationUpdate(rootId, blockId, relation.relationKey, new M.Relation(relation), (message: any) => {
			if (message.error.code || !view) {
				return;
			};
			
			if (callBack) {
				callBack(message);
			};
		});
	};

	dataviewRelationDelete (rootId: string, blockId: string, relationKey: string, view?: I.View, callBack?: (message: any) => void) {
		C.BlockDataviewRelationDelete(rootId, blockId, relationKey, (message: any) => {
			if (message.error.code || !view) {
				return;
			};
			
			if (callBack) {
				callBack(message);
			};

			view.relations = view.relations.filter((it: I.ViewRelation) => { return it.relationKey != relationKey; });
			C.BlockDataviewViewUpdate(rootId, blockId, view.id, view);
		});
	};

	checkDetails (rootId: string) {
		const object = detailStore.get(rootId, rootId, [ 'coverType', 'coverId', 'creator', 'layoutAlign', 'templateIsBundled' ]);
		const childrenIds = blockStore.getChildrenIds(rootId, rootId);
		const { iconEmoji, iconImage, coverType, coverId, type } = object;
		const ret: any = {
			object: object,
			withCover: Boolean((coverType != I.CoverType.None) && coverId),
			withIcon: false,
			className: [ this.layoutClass(object.id, object.layout), 'align' + object.layoutAlign ],
		};

		switch (object.layout) {
			default:
			case I.ObjectLayout.Page:
				ret.withIcon = iconEmoji || iconImage;
				break;

			case I.ObjectLayout.Human:
				ret.withIcon = true;
				break;

			case I.ObjectLayout.Task:
				break;

			case I.ObjectLayout.Set:
				ret.withIcon = iconEmoji || iconImage;
				break;

			case I.ObjectLayout.Image:
				ret.withIcon = true;
				break;

			case I.ObjectLayout.File:
				ret.withIcon = true;
				break;

			case I.ObjectLayout.ObjectType:
				ret.withIcon = true;
				break;

			case I.ObjectLayout.Relation:
				ret.withIcon = true;
				break;
		};

		if (childrenIds.indexOf(Constant.blockId.type) >= 0) {
			ret.className.push('noSystemBlocks');
		};

		if ((object[Constant.relationKey.featured] || []).indexOf(Constant.relationKey.description) >= 0) {
			ret.className.push('withDescription');
		};

		if (object.templateIsBundled) {
			ret.className.push('isBundled');
		};

		if (ret.withIcon && ret.withCover) {
			ret.className.push('withIconAndCover');
		} else
		if (ret.withIcon) {
			ret.className.push('withIcon');
		} else
		if (ret.withCover) {
			ret.className.push('withCover');
		};

		ret.className = ret.className.join(' ');
		return ret;
	};

	sortByName (c1: any, c2: any) {
		const n1 = c1.name.toLowerCase();
		const n2 = c2.name.toLowerCase();
		if (n1 > n2) return 1;
		if (n1 < n2) return -1;
		return 0;
	};

	sortByHidden (c1: any, c2: any) {
		if (c1.isHidden && !c2.isHidden) return 1;
		if (!c1.isHidden && c2.isHidden) return -1;
		return 0;
	};

	formatRelationValue (relation: I.Relation, value: any, maxCount: boolean) {
		switch (relation.format) {
			default:
				value = String(value || '');
				break;

			case I.RelationType.Number:
				value = parseFloat(String(value || '0'));
				break;
			case I.RelationType.Date:
				if ((value === '') || (value === undefined)) {
					value = null;
				};
				if (value !== null) {
					value = parseFloat(String(value || '0'));
				};
				break;

			case I.RelationType.Checkbox:
				value = Boolean(value);
				break;

			case I.RelationType.Status:
			case I.RelationType.File:
			case I.RelationType.Tag:
			case I.RelationType.Object:
			case I.RelationType.Relations:
				value = Util.objectCopy(value || []);
				value = Util.arrayUnique(value);
				value = value.map((it: any) => { return String(it || ''); });

				if (maxCount && relation.maxCount) {
					value = value.slice(value.length - relation.maxCount, value.length);
				};
				break;
		};
		return value;
	};

	checkTemplateCnt (typeIds: string[], limit: number, callBack?: (message: any) => void) {
		const filters: I.Filter[] = [
			{ operator: I.FilterOperator.And, relationKey: 'type', condition: I.FilterCondition.Equal, value: Constant.typeId.template },
			{ operator: I.FilterOperator.And, relationKey: 'targetObjectType', condition: I.FilterCondition.In, value: typeIds },
			{ operator: I.FilterOperator.And, relationKey: 'isArchived', condition: I.FilterCondition.Equal, value: false },
		];

		C.ObjectSearch(filters, [], [ 'id' ], '', 0, limit, (message: any) => {
			if (message.error.code) {
				return;
			};

			if (callBack) {
				callBack(message);
			};
		});
	};

};

export default new DataUtil();