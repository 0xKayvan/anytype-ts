import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observer } from 'mobx-react';
import $ from 'jquery';
import { I, Preview, DataUtil, translate } from 'Lib';
import { authStore } from 'Store';

interface Props {
	id?: string;
	className?: string;
	rootId: string;
	onClick: (e: any) => void;
}


const Sync = observer(class Sync extends React.Component<Props, {}> {

	public static defaultProps = {
		className: '',
	};

	constructor (props: any) {
		super(props);

		this.onMouseEnter = this.onMouseEnter.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
	};

	render () {
		const { id, className, rootId, onClick } = this.props;
		const { account } = authStore;
		const thread = authStore.threadGet(rootId);
		const disabled = account?.status?.type != I.AccountStatusType.Active;
		const status = disabled ? I.ThreadStatus.Disabled : ((thread.summary || {}).status || I.ThreadStatus.Unknown);
		
		return (
			<div id={id} className={[ 'sync', className ].join(' ')} onClick={onClick} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
				<div className={[ 'bullet', DataUtil.threadColor(status) ].join(' ')} />
				{translate('syncStatus' + status)}
			</div>
		);
	};

	onMouseEnter (e: any) {
		const { rootId } = this.props;
		const node = $(ReactDOM.findDOMNode(this));
		const thread = authStore.threadGet(rootId);
		const { summary } = thread;

		if (summary) {
			Preview.tooltipShow(translate('tooltip' + summary.status), node, I.MenuDirection.Center, I.MenuDirection.Bottom);
		};
	};
	
	onMouseLeave (e: any) {
		Preview.tooltipHide(false);
	};
	
});

export default Sync;