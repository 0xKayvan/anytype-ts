import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { RouteComponentProps } from 'react-router';
import { I, M, C, DataUtil } from 'ts/lib';
import { Block, Drag, Button } from 'ts/component';
import { commonStore, blockStore, detailStore } from 'ts/store';
import { observer } from 'mobx-react';

interface Props extends RouteComponentProps<any> {
	dataset?: any;
	rootId: string;
	readOnly: boolean;
	onKeyDown?(e: any, text: string, marks: I.Mark[], range: I.TextRange): void;
	onKeyUp?(e: any, text: string, marks: I.Mark[], range: I.TextRange): void;
	onMenuAdd? (id: string, text: string, range: I.TextRange): void;
	onPaste?(e: any): void;
	onResize?(v: number): void;
	getWrapper?(): any;
	getWrapperWidth?(): number;
};

const $ = require('jquery');

@observer
class EditorHeaderPage extends React.Component<Props, {}> {
	
	refDrag: any = null;

	constructor (props: any) {
		super(props);

		this.onScaleStart = this.onScaleStart.bind(this);
		this.onScaleMove = this.onScaleMove.bind(this);
		this.onScaleEnd = this.onScaleEnd.bind(this);
	}

	render (): any {
		const { rootId, onKeyDown, onKeyUp, onMenuAdd, onPaste, readOnly } = this.props;
		const root = blockStore.getLeaf(rootId, rootId);
		const { config } = commonStore;

		if (!root) {
			return null;
		};

		const check = DataUtil.checkDetails(rootId);
		const object = detailStore.get(rootId, rootId, [ 'layoutAlign', 'templateIsBundled' ]);
		const header = blockStore.getLeaf(rootId, 'header') || {};
		const cover = new M.Block({ id: rootId + '-cover', type: I.BlockType.Cover, align: object.layoutAlign, childrenIds: [], fields: {}, content: {} });
		const icon: any = new M.Block({ id: rootId + '-icon', type: I.BlockType.IconPage, align: object.layoutAlign, childrenIds: [], fields: {}, content: {} });

		if (root.isObjectHuman()) {
			icon.type = I.BlockType.IconUser;
		};

		return (
			<div>
				<div id="editorSize" className="dragWrap">
					<Drag 
						ref={(ref: any) => { this.refDrag = ref; }} 
						value={root.fields.width}
						snap={0.5}
						onStart={this.onScaleStart} 
						onMove={this.onScaleMove} 
						onEnd={this.onScaleEnd} 
					/>
					<div id="dragValue" className="number">100%</div>
				</div>

				{object.templateIsBundled ? (
					<div className="note">
						<div className="inner">
							<div className="sides">
								<div className="side left">
									This template cannot be changed, because it is Basic for this object type.<br />
									If you want to edit, create a Duplicate of this template.
								</div>
								<div className="side right">
									<Button className="dark" text="Duplicate" />
								</div>
							</div>
						</div>
					</div>
				) : ''}

				{check.withCover ? <Block {...this.props} key={cover.id} block={cover} /> : ''}
				{check.withIcon ? <Block {...this.props} key={icon.id} block={icon} /> : ''}

				<Block 
					key={header.id} 
					{...this.props}
					readOnly={readOnly || object.templateIsBundled}
					index={0}
					block={header}
					onKeyDown={onKeyDown}
					onKeyUp={onKeyUp}  
					onMenuAdd={onMenuAdd}
					onPaste={onPaste}
				/>
			</div>
		);
	};

	componentDidMount () {
		const { rootId } = this.props;
		const root = blockStore.getLeaf(rootId, rootId);

		this.init();

		if (this.refDrag) {
			this.refDrag.setValue(root.fields.width);
		};
	};

	componentDidUpdate () {
		this.init();
	};

	init () {
		const { rootId, getWrapper } = this.props;
		const check = DataUtil.checkDetails(rootId);

		getWrapper().attr({ class: [ 'editorWrapper', check.className ].join(' ') });
	};

	onScaleStart (v: number) {
		const { dataset } = this.props;
		const { selection } = dataset || {};
		
		selection.preventSelect(true);
	};
	
	onScaleMove (v: number) {
		const node = $(ReactDOM.findDOMNode(this));
		const value = node.find('#dragValue');

		value.text(Math.ceil(v * 100) + '%');

		this.props.onResize(v);
	};
	
	onScaleEnd (v: number) {
		const { rootId, dataset } = this.props;
		const { selection } = dataset || {};

		selection.preventSelect(false);

		C.BlockListSetFields(rootId, [
			{ blockId: rootId, fields: { width: v } },
		]);
	};
	
};

export default EditorHeaderPage;