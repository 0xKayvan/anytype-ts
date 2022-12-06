import { I, Util } from 'Lib';
import { observable, intercept, makeObservable } from 'mobx';

import View from '../view';

class BlockContentDataview implements I.ContentDataview {
	
	sources: string[] = [];
	views: I.View[] = [];
	relationLinks: any[] = [];
	groupOrder: any[] = [];
	objectOrder: any[] = [];
	targetObjectId: string = '';
	
	constructor (props: I.ContentDataview) {
		let self = this;

		self.targetObjectId = String(props.targetObjectId || '');
		self.sources = props.sources || [];
		self.views = (props.views || []).map(it => new View(it));
		self.relationLinks = props.relationLinks || [];
		self.groupOrder = props.groupOrder || [];
		self.objectOrder = props.objectOrder || [];

		makeObservable(self, {
			sources: observable,
			views: observable,
			groupOrder: observable,
			objectOrder: observable,
		});

		intercept(self as any, (change: any) => { return Util.intercept(self, change); });
	};

};

export default BlockContentDataview;