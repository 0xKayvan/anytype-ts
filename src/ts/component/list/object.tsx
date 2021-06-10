import * as React from 'react';
import { I, C, DataUtil, Util } from 'ts/lib';
import { IconObject, Pager } from 'ts/component';
import { detailStore, dbStore } from 'ts/store';

interface Props {
	rootId: string;
	blockId: string;
};

const Constant = require('json/constant.json');

class ListObject extends React.Component<Props, {}> {

	public static defaultProps = {
	};
	
	render () {
		const { rootId, blockId } = this.props;
		const items = Util.objectCopy(dbStore.getData(rootId, blockId)).map((it: any) => {
			it.name = String(it.name || Constant.default.name || '');
			return it;
		});
		const { offset, total, viewId } = dbStore.getMeta(rootId, blockId);

		let pager = null;
		if (total && items.length) {
			pager = (
				<Pager 
					offset={offset} 
					limit={Constant.limit.dataview.records} 
					total={total} 
					onChange={(page: number) => { this.getData(viewId, (page - 1) * Constant.limit.dataview.records); }} 
				/>
			);
		};

		const Row = (item: any) => {
			const author = detailStore.get(rootId, item.creator, []);
			return (
				<tr className={[ 'row', (item.isHidden ? 'isHidden' : '') ].join(' ')}>
					<td className="cell">
						<div className="cellContent isName cp" onClick={(e: any) => { DataUtil.objectOpenEvent(e, item); }}>
							<IconObject object={item} />
							<div className="name">{item.name}</div>
						</div>
					</td>
					<td className="cell">
						{item.lastModifiedDate ? (
							<div className="cellContent">
								{Util.date(DataUtil.dateFormat(I.DateFormat.MonthAbbrBeforeDay), item.lastModifiedDate)}
							</div>
						) : ''}
					</td>
					<td className="cell">
						{!author._objectEmpty_ ? (
							<div className="cellContent cp" onClick={(e: any) => { DataUtil.objectOpenEvent(e, author); }}>
								<IconObject object={author} />
								<div className="name">{author.name}</div>
							</div>
						) : ''}
					</td>
				</tr>
			);
		};

		return (
			<React.Fragment>
				<table>
					<thead>
						<tr className="row">
							<th className="cellHead">
								<div className="name">Name</div>
							</th>
							<th className="cellHead">
								<div className="name">Updated</div>
							</th>
							<th className="cellHead">
								<div className="name">Owner</div>
							</th>
						</tr>
					</thead>
					<tbody>
						{!items.length ? (
							<tr>
								<td className="cell empty" colSpan={3}>No objects yet</td>
							</tr>
						) : (
							<React.Fragment>
								{items.map((item: any, i: number) => (
									<Row key={i} {...item} />
								))}
							</React.Fragment>
						)}
					</tbody>
				</table>
				
				{pager}
			</React.Fragment>
		);
	};

	getData (id: string, offset: number, callBack?: (message: any) => void) {
		const { rootId, blockId } = this.props;
		const meta: any = { offset: offset };

		dbStore.metaSet(rootId, blockId, meta);
		C.BlockDataviewViewSetActive(rootId, blockId, id, offset, Constant.limit.dataview.records, callBack);
	};

};

export default ListObject;