import * as React from 'react';
import $ from 'jquery';
import { observer } from 'mobx-react';
import { Icon, IconObject, Sync, ObjectName } from 'Component';
import { I, DataUtil, ObjectUtil, Preview, keyboard } from 'Lib';
import { blockStore, detailStore, menuStore, popupStore } from 'Store';
import Constant from 'json/constant.json';

interface Props extends I.HeaderComponent {};

const HeaderMainEdit = observer(class HeaderMainEdit extends React.Component<Props, object> {

	timeout: number = 0;

	constructor (props: any) {
		super(props);
		
		this.onMore = this.onMore.bind(this);
		this.onSync = this.onSync.bind(this);
		this.onOpen = this.onOpen.bind(this);

		this.onPathOver = this.onPathOver.bind(this);
		this.onPathOut = this.onPathOut.bind(this);
	};

	render () {
		const { rootId, onHome, onForward, onBack, onNavigation, onGraph, onSearch } = this.props;
		const root = blockStore.getLeaf(rootId, rootId);

		if (!root) {
			return null;
		};

		const object = detailStore.get(rootId, rootId, [ 'templateIsBundled' ]);
		const canSync = !object.templateIsBundled && !root.isObjectFileKind();
		const isLocked = root.isLocked();
		const showNav = !(root.isObjectType() || root.isObjectRelation());

		return (
			<React.Fragment>
				<div className="side left">
					<Icon className="expand big" tooltip="Open as object" onClick={this.onOpen} />
					<Icon className="home big" tooltip="Home" onClick={onHome} />
					<Icon className={[ 'back', 'big', (!keyboard.checkBack() ? 'disabled' : '') ].join(' ')} tooltip="Back" onClick={onBack} />
					<Icon className={[ 'forward', 'big', (!keyboard.checkForward() ? 'disabled' : '') ].join(' ')} tooltip="Forward" onClick={onForward} />
					
					{showNav ? (
						<React.Fragment>
							<Icon className="nav big" tooltip="Navigation" onClick={onNavigation} />
							<Icon className="graph big nm" tooltip="Open as graph" onClick={onGraph} />
						</React.Fragment>
					) : ''}
				</div>

				<div className="side center">
					<div id="path" className="path" onClick={onSearch} onMouseOver={this.onPathOver} onMouseOut={this.onPathOut}>	
						<div className="inner">
							<IconObject object={object} size={18} />
							<ObjectName object={object} />
							{isLocked ? <Icon className="lock" /> : ''}
						</div>
					</div>
				</div>

				<div className="side right">
					{canSync ? <Sync id="button-header-sync" rootId={rootId} onClick={this.onSync} /> : ''}
					<Icon id="button-header-more" tooltip="Menu" className="more big" onClick={this.onMore} />
				</div>
			</React.Fragment>
		);
	};

	componentDidMount () {
		this.setTitle();
	};

	componentDidUpdate () {
		this.setTitle();
	};

	onOpen () {
		const { rootId } = this.props;
		const object = detailStore.get(rootId, rootId, []);

		keyboard.disableClose(true);
		popupStore.closeAll(null, () => { ObjectUtil.openRoute(object); });
	};
	
	onMore (e: any) {
		if (menuStore.isOpen()) {
			menuStore.closeAll();
			return;
		};

		const { isPopup, match, rootId } = this.props;
		const st = $(window).scrollTop();
		const elementId = `${this.getContainer()} #button-header-more`;
		const param: any = {
			element: elementId,
			horizontal: I.MenuDirection.Right,
			subIds: Constant.menuIds.more,
			data: {
				rootId,
				blockId: rootId,
				blockIds: [ rootId ],
				match,
				isPopup,
			}
		};

		if (!isPopup) {
			const element = $(elementId);

			param.fixedY = element.offset().top + element.height() + 4 - st;
			param.classNameWrap = 'fixed fromHeader';
		} else {
			param.offsetY = 4;
		};

		menuStore.closeAll(null, () => { menuStore.open('blockMore', param); });
	};

	onSync (e: any) {
		if (menuStore.isOpen()) {
			menuStore.closeAll();
			return;
		};

		const { isPopup, rootId } = this.props;
		const st = $(window).scrollTop();
		const elementId = `${this.getContainer()} #button-header-sync`;
		const param: any = {
			element: elementId,
			horizontal: I.MenuDirection.Right,
			data: {
				rootId: rootId,
			}
		};

		if (!isPopup) {
			const element = $(elementId);
			param.fixedY = element.offset().top + element.height() + 4 - st;
			param.classNameWrap = 'fixed fromHeader';
		} else {
			param.offsetY = 4;
		};

		menuStore.closeAll(null, () => { menuStore.open('threadList', param); });
	};

	onPathOver (e: any) {
		Preview.tooltipShow('Click to search', $(e.currentTarget), I.MenuDirection.Center, I.MenuDirection.Bottom);
	};

	onPathOut () {
		Preview.tooltipHide(false);
	};

	getContainer () {
		const { isPopup } = this.props;
		return (isPopup ? '.popup' : '') + ' .header';
	};

	setTitle () {
		const { rootId, isPopup } = this.props;

		if (!isPopup) {
			DataUtil.setWindowTitle(rootId);
		};
	};
	
});

export default HeaderMainEdit;