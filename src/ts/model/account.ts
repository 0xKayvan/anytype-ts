import { I, Util } from 'Lib';
import { observable, intercept, makeObservable } from 'mobx';

class AccountInfo implements I.AccountInfo {
	
	homeObjectId: string = ''
	profileObjectId: string = '';
	gatewayUrl: string = '';
	marketplaceTypeObjectId: string = '';
	marketplaceTemplateObjectId: string = '';
	marketplaceRelationObjectId: string = '';
	deviceId: string = '';
	localStoragePath: string = '';
	accountSpaceId: string = '';
	
	constructor (props: I.AccountInfo) {
		const self = this;
		
		self.homeObjectId = String(props.homeObjectId || '');
		self.profileObjectId = String(props.profileObjectId || '');
		self.gatewayUrl = String(props.gatewayUrl || '');
		self.marketplaceTypeObjectId = String(props.marketplaceTypeObjectId || '');
		self.marketplaceTemplateObjectId = String(props.marketplaceTemplateObjectId || '');
		self.marketplaceRelationObjectId = String(props.marketplaceRelationObjectId || '');
		self.deviceId = String(props.deviceId || '');
		self.localStoragePath = String(props.localStoragePath || '');
		self.accountSpaceId = String(props.accountSpaceId || '');

		makeObservable(self, {
			homeObjectId: observable,
			profileObjectId: observable,
			gatewayUrl: observable,
			marketplaceTypeObjectId: observable,
			marketplaceRelationObjectId: observable,
			marketplaceTemplateObjectId: observable,
			deviceId: observable,
			localStoragePath: observable,
			accountSpaceId: observable,
		});

		intercept(self as any, (change: any) => { return Util.intercept(self, change); });
		return self;
	};

};

class AccountConfig implements I.AccountConfig {
	
	allowSpaces: boolean = false;
	allowBeta: boolean = false;
	
	constructor (props: I.AccountConfig) {
		const self = this;
		
		self.allowSpaces = Boolean(props.allowSpaces);
		self.allowBeta = Boolean(props.allowBeta);

		makeObservable(self, {
			allowSpaces: observable,
			allowBeta: observable,
		});

		intercept(self as any, (change: any) => { return Util.intercept(self, change); });
		return self;
	};

};

class AccountStatus implements I.AccountStatus {
	
	type: I.AccountStatusType = I.AccountStatusType.Active;
	date: number = 0;
	
	constructor (props: I.AccountStatus) {
		const self = this;
		
		self.type = Number(props.type) || I.AccountStatusType.Active;
		self.date = Number(props.date) || 0;

		makeObservable(self, {
			type: observable,
			date: observable,
		});

		intercept(self as any, (change: any) => { return Util.intercept(self, change); });
		return self;
	};

};

class Account implements I.Account {
	
	id: string = '';
	info: I.AccountInfo = null;
	config: I.AccountConfig = null;
	status: I.AccountStatus = null;
	
	constructor (props: I.Account) {
		const self = this;
		
		self.id = String(props.id || '');
		self.info = new AccountInfo(props.info);
		self.config = new AccountConfig(props.config);
		self.status = new AccountStatus(props.status);

		makeObservable(self, {
			id: observable,
			status: observable,
		});

		intercept(self as any, (change: any) => { return Util.intercept(self, change); });
		return self;
	};

};

export default Account;