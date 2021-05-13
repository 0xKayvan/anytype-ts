import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { Icon, IconObject, MenuItemVertical } from 'ts/component';
import { I, C, Util, DataUtil } from 'ts/lib';
import { observer } from 'mobx-react';
import { commonStore, blockStore, detailStore, menuStore } from 'ts/store';
import arrayMove from 'array-move';

interface Props extends I.Menu {};

const $ = require('jquery');
const { dialog } = window.require('electron').remote;

@observer
class MenuDataviewMedia extends React.Component<Props, {}> {

	_isMounted: boolean = false;

	constructor (props: any) {
		super(props);

		this.onSortEnd = this.onSortEnd.bind(this);
		this.onAdd = this.onAdd.bind(this);
		this.onUpload = this.onUpload.bind(this);
	};

	render () {
		const { param, position } = this.props;
		const { data } = param;
		const { rootId, blockId } = data;
		const block = blockStore.getLeaf(rootId, blockId);
		
		let value = Util.objectCopy(data.value || []);
		value = value.map((it: string) => { return detailStore.get(rootId, it, [ 'fileExt' ]); });
		value = value.filter((it: any) => { return !it._objectEmpty_; });

        const Handle = SortableHandle(() => (
			<Icon className="dnd" />
		));

		const File = (item: any) => (
			<React.Fragment>
				<IconObject object={item} />
				<div className="name">{item.name + (item.fileExt ? `.${item.fileExt}` : '')}</div>
			</React.Fragment>
		);

		const Image = (item: any) => (
			<img src={commonStore.imageUrl(item.id, 208)} className="preview" onLoad={() => { position(); }} />
		);

        const Item = SortableElement((item: any) => {
			let content = null;
			let cn = [ 'item' ];
			let name = item.name + (item.fileExt ? `.${item.fileExt}` : '');

			switch (item.layout) {
				case I.ObjectLayout.File:
					cn.push('isFile');
					content = <File {...item} name={name} />;
					break;

				case I.ObjectLayout.Image:
					cn.push('isImage');
					content = <Image {...item} />;
					break;
			};
			return (
				<div id={'item-' + item.id} className={cn.join(' ')}>
					<Handle />
					<div className="clickable" onClick={(e: any) => { DataUtil.objectOpenPopup(item); }}>
						{content}
					</div>
					<Icon className="more" onClick={(e: any) => { this.onMore(e, item); }} />
				</div>
			);
		});

        const List = SortableContainer((item: any) => {
			return (
				<div className="items">
					{value.map((item: any, i: number) => (
						<Item key={i} {...item} index={i} />
					))}
				</div>
			);
		});

		return (
			<div className="items">
				<div className="section">
					<MenuItemVertical id="add" icon="plus" name="Add" onClick={this.onAdd} />
					<MenuItemVertical id="upload" icon="upload" name="Upload" onClick={this.onUpload} />
				</div>

				{value.length ? (
					<div className="section">
						<List 
							axis="y" 
							lockAxis="y"
							lockToContainerEdges={true}
							transitionDuration={150}
							distance={10}
							onSortEnd={this.onSortEnd}
							useDragHandle={true}
							helperClass="isDragging"
							helperContainer={() => { return $(ReactDOM.findDOMNode(this)).get(0); }}
						/>
					</div>
				) : ''}
			</div>
		);
	};
	
	componentDidMount () {
		this._isMounted = true;
	};

	componentWillUnmount () {
		this._isMounted = false;
		menuStore.close('searchObject');
    };
    
    onSortEnd (result: any) {
		const { oldIndex, newIndex } = result;
		const { param } = this.props;
		const { data } = param;
		
		let value = Util.objectCopy(data.value || []);
		value = arrayMove(value, oldIndex, newIndex);

		this.save(value);
    };

	onAdd (e: any) {
		const { getId, close, param } = this.props;

		menuStore.open('searchObject', {
			element: `#${getId()} #item-add`,
			className: 'single',
			offsetX: param.width,
			offsetY: -36,
			data: {
				noClose: true,
				placeHolderFocus: 'Find a file...',
				filters: [
					{ operator: I.FilterOperator.And, relationKey: 'layout', condition: I.FilterCondition.In, value: [ I.ObjectLayout.File, I.ObjectLayout.Image ] }
				],
				onSelect: (item: any) => {
					this.add(item.id);
				}
			}
		});
	};
	
	onUpload (e: any) {
		const options: any = { 
			properties: [ 'openFile' ], 
			filters: [  ] 
		};
		
		dialog.showOpenDialog(options).then((result: any) => {
			const files = result.filePaths;
			const file = files && files.length ? files[0] : '';

			C.UploadFile('', file, I.FileType.None, false, (message: any) => {
				if (!message.error.code) {
					this.add(message.hash);
				};
			});
		});
	};

	add (hash: string) {
		const { param } = this.props;
		const { data } = param;

		let value = Util.objectCopy(data.value || []);
		value.push(hash);
		value = Util.arrayUnique(value);

		this.save(value);
	};	

	save (value: string[]) {
		const { param, id } = this.props;
		const { data } = param;
		const { onChange } = data;

		onChange(value);
		menuStore.updateData(id, { value: value });
	};

	onMore (e: any, item: any) {
		const { getId, param, id } = this.props;
		const { data } = param;
		const { onChange } = data;
		const element = $(`#${getId()} #item-${item.id}`);

		element.addClass('active');

		menuStore.open('select', { 
			element: element.find('.icon.more'),
			offsetY: 4,
			horizontal: I.MenuDirection.Center,
			onClose: () => {
				element.removeClass('active');
			},
			data: {
				value: '',
				options: [
					{ id: 'remove', icon: 'remove', name: 'Delete' },
				],
				onSelect: (event: any, el: any) => {
					if (el.id == 'remove') {
						let value = Util.objectCopy(data.value || []);
						value = value.filter((it: any) => { return it != item.id; });
						value = Util.arrayUnique(value);

						onChange(value);
						menuStore.updateData(id, { value: value });
					};
				},
			}
		});
	};

};

export default MenuDataviewMedia;