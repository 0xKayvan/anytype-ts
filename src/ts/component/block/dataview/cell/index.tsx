import * as React from 'react';
import { I, DataUtil, Util } from 'ts/lib';
import { menuStore, dbStore } from 'ts/store';
import { observable } from 'mobx';

import CellText from './text';
import CellSelect from './select';
import CellCheckbox from './checkbox';
import CellObject from './object';
import CellFile from './file';

interface Props extends I.Cell {
	relationKey?: string;
	storeId?: string;
	menuClassName?: string;
	optionCommand?: (code: string, rootId: string, blockId: string, relationKey: string, recordId: string, option: I.SelectOption, callBack?: (message: any) => void) => void;
};

const $ = require('jquery');
const Constant = require('json/constant.json');
const { ipcRenderer } = window.require('electron');

class Cell extends React.Component<Props, {}> {

	public static defaultProps = {
		index: 0,
	};

	ref: any = null;
	
	constructor (props: any) {
		super(props);
		
		this.onClick = this.onClick.bind(this);
		this.onChange = this.onChange.bind(this);
	};

	render () {
		const { relationKey, index, onClick, idPrefix } = this.props;
		const relation = this.getRelation();
		if (!relation) {
			return null;
		};

		const canEdit = this.canEdit();
		const cn = [ 
			'cellContent', 
			DataUtil.relationClass(relation.format), 
			(this.canEdit() ? 'canEdit' : ''), 
			(relationKey == 'name' ? 'isName' : ''),
		];

		let CellComponent: React.ReactType<Props>;
		switch (relation.format) {
			default:
			case I.RelationType.ShortText:
			case I.RelationType.Number:
			case I.RelationType.LongText:
			case I.RelationType.Date:
				CellComponent = CellText;
				break;

			case I.RelationType.Status:	
			case I.RelationType.Tag:
				CellComponent = CellSelect;
				break;
				
			case I.RelationType.Checkbox:
				CellComponent = CellCheckbox;
				break;

			case I.RelationType.File:
				CellComponent = CellFile;
				break;
				
			case I.RelationType.Object:
				CellComponent = CellObject;
				break;
				
			case I.RelationType.Url:
			case I.RelationType.Email:
			case I.RelationType.Phone:
				CellComponent = CellText;
				break;
		};
		
		return (
			<div className={cn.join(' ')} onClick={onClick}>
				<CellComponent 
					ref={(ref: any) => { this.ref = ref; }} 
					id={DataUtil.cellId(idPrefix, relation.relationKey, index)} 
					{...this.props} 
					canEdit={canEdit}
					relation={relation}
					onChange={this.onChange} 
				/>
			</div>
		);
	};

	onClick (e: any) {
		e.stopPropagation();

		const { rootId, block, index, getRecord, readOnly, menuClassName, idPrefix, pageContainer, scrollContainer, optionCommand } = this.props;
		const relation = this.getRelation();

		if (!relation || readOnly || relation.isReadOnly) {
			return;
		};

		if (!this.canEdit()) {
			return;
		};

		$('.cell.isEditing').removeClass('isEditing');

		const win = $(window);
		const id = DataUtil.cellId(idPrefix, relation.relationKey, index);
		const cell = $('#' + id).addClass('isEditing');
		const element = cell.find('.cellContent');
		const width = Math.max(element.outerWidth(), Constant.size.dataview.cell.edit);
		const height = cell.outerHeight();
		const record = getRecord(index);
		const value = record[relation.relationKey] || '';

		let menuId = '';
		let setOn = () => {
			if (!this.ref) {
				return;
			};
			if (this.ref.setEditing) {
				this.ref.setEditing(true);
			};
			if (this.ref.onClick) {
				this.ref.onClick();
			};
			if (menuId) {
				$(scrollContainer).addClass('over');
			};
			win.trigger('resize');
		};

		let setOff = () => {
			cell.removeClass('isEditing');

			if (this.ref && this.ref.setEditing) {
				this.ref.setEditing(false);
			};
			if (menuId) {
				$(scrollContainer).removeClass('over');
			};
		};

		let param: I.MenuParam = { 
			element: `#${id} .cellContent`,
			horizontal: I.MenuDirection.Center,
			noAnimation: true,
			noFlipY: true,
			passThrough: true,
			className: menuClassName,
			onOpen: setOn,
			onClose: setOff,
			data: { 
				rootId: rootId,
				blockId: block.id,
				value: value, 
				relation: observable.box(relation),
				record: record,
				optionCommand: optionCommand,
				onChange: (value: any) => {
					if (this.ref && this.ref.onChange) {
						this.ref.onChange(value);
					};
					this.onChange(value);
				},
			},
		};

		switch (relation.format) {

			case I.RelationType.Date:
				param = Object.assign(param, {
					offsetY: 14,
				});
				param.data = Object.assign(param.data, {
					value: param.data.value || Util.time(),
				});
					
				menuId = 'dataviewCalendar';
				break;

			case I.RelationType.File:
				if (!value.length) {
					break;
				};

				param = Object.assign(param, {
					offsetY: -height + 1,
					width: width,
				});
				param.data = Object.assign(param.data, {
					value: value || [],
				});

				menuId = 'dataviewMedia';
				break;

			case I.RelationType.Status:
			case I.RelationType.Tag:
				param = Object.assign(param, {
					width: width,
				});
				param.data = Object.assign(param.data, {
					canAdd: true,
					filter: '',
					value: value || [],
					maxCount: relation.maxCount,
				});

				menuId = (relation.maxCount == 1 ? 'dataviewOptionList' : 'dataviewOptionValues');
				break;
					
			case I.RelationType.Object:
				param = Object.assign(param, {
					width: width,
				});
				param.data = Object.assign(param.data, {
					filter: '',
					value: value || [],
					types: relation.objectTypes,
					maxCount: relation.maxCount,
				});

				menuId = (relation.maxCount == 1 ? 'dataviewObjectList' : 'dataviewObjectValues');
				break;

			case I.RelationType.LongText:
				param = Object.assign(param, {
					element: cell,
					offsetY: -height,
					width: width,
				});

				menuId = 'dataviewText';
				break;

			case I.RelationType.Url:
			case I.RelationType.Email:
			case I.RelationType.Phone:
				if (!value) {
					break;
				};

				param = Object.assign(param, {
					type: I.MenuType.Horizontal,
					className: 'button',
					width: width,
				});

				let name = 'Go to';
				if (relation.format == I.RelationType.Email) {
					name = 'Mail to';
				};
				if (relation.format == I.RelationType.Phone) {
					name = 'Call to';
				};

				param.data = Object.assign(param.data, {
					options: [
						{ id: 'go', name: name },
						{ id: 'copy', name: 'Copy' },
					],
					onSelect: (event: any, item: any) => {
						let scheme = '';
						if (relation.format == I.RelationType.Url) {
							if (!value.match(/:\/\//)) {
								scheme = 'http://';
							};
						};
						if (relation.format == I.RelationType.Email) {
							scheme = 'mailto:';
						};
						if (relation.format == I.RelationType.Phone) {
							scheme = 'tel:';
						};

						if (item.id == 'go') {
							ipcRenderer.send('urlOpen', scheme + value);
						};

						if (item.id == 'copy') {
							Util.clipboardCopy({ text: value, html: value });
						};
					},
				});

				menuId = 'button';
				break;
					
			case I.RelationType.Checkbox:
				cell.removeClass('isEditing');
				break; 
		};

		if (menuId) {
			menuStore.closeAll(Constant.cellMenuIds);
			window.setTimeout(() => {
				menuStore.open(menuId, param); 
				$(pageContainer).unbind('click').on('click', () => { menuStore.closeAll(Constant.cellMenuIds); });
				//win.unbind('blur.cell').on('blur.cell', () => { menuStore.closeAll(Constant.cellMenuIds); });
			}, Constant.delay.menu);
		} else {
			setOn();
		};
	};

	onChange (value: any) {
		const { onCellChange, index, getRecord } = this.props;
		const relation = this.getRelation();
		if (!relation) {
			return null;
		};

		const record = getRecord(index);
		if (onCellChange) {
			onCellChange(record.id, relation.relationKey, DataUtil.formatRelationValue(relation, value));
		};
	};

	getRelation () {
		const { rootId, storeId, relation, block, relationKey } = this.props;
		return relation ? relation : dbStore.getRelation(rootId, (storeId || block.id), relationKey);
	};

	canEdit () {
		const { readOnly, viewType } = this.props;
		const relation = this.getRelation();

		if (!relation || readOnly || relation.isReadOnly) {
			return false;
		};
		if (relation.format == I.RelationType.Checkbox) {
			return true;
		};
		return (viewType == I.ViewType.Grid);
	};
	
};

export default Cell;