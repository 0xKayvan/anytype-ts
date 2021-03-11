import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { Icon, Switch } from 'ts/component';
import { I, C, DataUtil } from 'ts/lib';
import { commonStore, dbStore } from 'ts/store';
import { observer } from 'mobx-react';
import arrayMove from 'array-move';

interface Props extends I.Menu {};

const $ = require('jquery');

@observer
class MenuRelationList extends React.Component<Props, {}> {
	
	constructor (props: any) {
		super(props);
		
		this.onAdd = this.onAdd.bind(this);
		this.onEdit = this.onEdit.bind(this);
		this.onSortEnd = this.onSortEnd.bind(this);
		this.onSwitch = this.onSwitch.bind(this);
	};
	
	render () {
		const { param } = this.props;
		const { data } = param;
		const { readOnly, rootId, blockId, getView } = data;
		const view = getView();
		const relations = DataUtil.viewGetRelations(rootId, blockId, view);

		relations.map((it: any) => {
			it.relation = dbStore.getRelation(rootId, blockId, it.relationKey) || {};
			const { format, name } = it.relation;
		});

		const Handle = SortableHandle(() => (
			<Icon className="dnd" />
		));

		const Item = SortableElement((item: any) => {
			return (
				<div id={'item-' + item.relationKey} className={[ 'item', (item.relation.isHidden ? 'isHidden' : '') ].join(' ')}>
					<Handle />
					<span className="clickable" onClick={(e: any) => { this.onEdit(e, item.relationKey); }}>
						<Icon className={'relation ' + DataUtil.relationClass(item.relation.format)} />
						<div className="name">{item.relation.name}</div>
					</span>
					<Switch value={item.isVisible} className="green" onChange={(e: any, v: boolean) => { this.onSwitch(e, item.relationKey, v); }} />
				</div>
			);
		});
		
		const ItemAdd = SortableElement((item: any) => (
			<div id="item-add" className="item add" onClick={this.onAdd}>
				<Icon className="plus" />
				<div className="name">New relation</div>
			</div>
		));
		
		const List = SortableContainer((item: any) => {
			return (
				<div className="items">
					{relations.map((item: any, i: number) => {
						return <Item key={item.relationKey} {...item} index={i} />;
					})}
					{!readOnly ? <ItemAdd index={view.relations.length + 1} disabled={true} /> : ''}
				</div>
			);
		});
		
		return (
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
		);
	};
	
	componentDidUpdate () {
		this.props.position();
	};

	onAdd (e: any) {
		const { param, getId, close } = this.props;
		const { data } = param;
		const { rootId, blockId, getView } = data;
		const view = getView();
		const relations = DataUtil.viewGetRelations(rootId, blockId, view);

		commonStore.menuOpen('relationSuggest', { 
			element: `#${getId()} #item-add`,
			offsetX: 256,
			offsetY: 4,
			vertical: I.MenuDirection.Center,
			data: {
				...data,
				menuIdEdit: 'dataviewRelationEdit',
				filter: '',
				skipIds: relations.map((it: I.ViewRelation) => { return it.relationKey; }),
				addCommand: (rootId: string, blockId: string, relation: any) => {
					DataUtil.dataviewRelationAdd(rootId, blockId, relation, getView(), (message: any) => { commonStore.menuClose('relationSuggest'); });
				},
				listCommand: (rootId: string, blockId: string, callBack?: (message: any) => void) => {
					C.BlockDataviewRelationListAvailable(rootId, blockId, callBack);
				},
			}
		});
	};
	
	onEdit (e: any, id: string) {
		const { param, getId } = this.props;
		const { data } = param;
		const { readOnly } = data;

		if (readOnly) {
			return;
		};
		
		commonStore.menuOpen('dataviewRelationEdit', { 
			element: `#${getId()} #item-${id}`,
			offsetY: 4,
			horizontal: I.MenuDirection.Center,
			data: {
				...data,
				relationKey: id,
			}
		});
	};
	
	onSortEnd (result: any) {
		const { oldIndex, newIndex } = result;
		const { param } = this.props;
		const { data } = param;
		const { getView } = data;
		const view = getView();
		
		view.relations = arrayMove(view.relations, oldIndex, newIndex);
		this.save();
	};

	onSwitch (e: any, id: string, v: boolean) {
		const { param } = this.props;
		const { data } = param;
		const { getView } = data;
		const relation = getView().getRelation(id);

		if (relation) {
			relation.isVisible = v;
			this.save();
		};
	};

	save () {
		const { param } = this.props;
		const { data } = param;
		const { rootId, blockId, onSave, getView } = data;
		const view = getView();

		C.BlockDataviewViewUpdate(rootId, blockId, view.id, view, onSave);
	};
	
};

export default MenuRelationList;