import * as React from 'react';
import { Icon, Title, Label } from 'Component';
import { I, Util, translate } from 'Lib';
import { observer } from 'mobx-react';
import { commonStore } from 'Store';
import Head from '../head';

interface Props extends I.Popup {
	prevPage: string;
	onPage: (id: string) => void;
	onImport: (type: I.ImportType, param: any) => void;
};

const PopupSettingsPageImportIndex = observer(class PopupSettingsPageImportIndex extends React.Component<Props> {

	render () {
		const items = this.getItems();

		const Item = (item: any) => {
			return (
				<div className={[ 'item', item.id ].join(' ')} onClick={() => { this.onClick(item.id); }} >
					<Icon />
					<div className="name">{item.name}</div>
				</div>
			);
		};

		return (
			<React.Fragment>
				<Title text={translate('popupSettingsImportTitle')} />
				<Label className="description" text={translate('popupSettingsImportText')} />

				<div className="items">
					{items.map((item: any, i: number) => (
						<Item key={i} {...item} />
					))}
				</div>
			</React.Fragment>
		);
	};

	onClick (id: string) {
		const { onPage } = this.props;
		const items = this.getItems();
		const item = items.find(it => it.id == id);
		const fn = Util.toCamelCase('onImport-' + item.id);

		if (item.skipPage && this[fn]) {
			this[fn]();
		} else {
			onPage(Util.toCamelCase('import-' + item.id));
		};
	};

	getItems () {
		return [
			{ id: 'notion', name: 'Notion' },
			{ id: 'markdown', name: 'Markdown' },
			{ id: 'html', name: 'HTML', skipPage: true },
			{ id: 'text', name: 'TXT', skipPage: true },
			{ id: 'csv', name: 'CSV', skipPage: true },
		];
	};

	onImportCommon (type: I.ImportType, extensions: string[], options?: any) {
		const { close, onImport } = this.props;
		const platform = Util.getPlatform();
		const fileOptions: any = { 
			properties: [ 'openFile' ],
			filters: [ { name: '', extensions } ]
		};

		if (platform == I.Platform.Mac) {
			fileOptions.properties.push('openDirectory');
		};

		window.Electron.showOpenDialog(fileOptions).then((result: any) => {
			const paths = result.filePaths;
			if ((paths == undefined) || !paths.length) {
				return;
			};

			close();
			onImport(type, Object.assign(options || {}, { paths }));
		});
	};

	onImportHtml () {
		this.onImportCommon(I.ImportType.Html, [ 'zip', 'html', 'htm', 'mhtml' ]);
	};

	onImportText () {
		this.onImportCommon(I.ImportType.Text, [ 'zip', 'txt' ]);
	};

	onImportCsv () {
		this.onImportCommon(I.ImportType.Csv, [ 'zip', 'csv' ], { mode: I.CsvImportMode.Collection });
	};

});

export default PopupSettingsPageImportIndex;