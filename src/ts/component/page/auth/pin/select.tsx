import * as React from 'react';
import { Frame, Cover, Title, Label, Error, Pin, Header, Footer } from 'Component';
import { I, translate, Util } from 'Lib';
import { commonStore, authStore } from 'Store';
import { observer } from 'mobx-react';

interface State {
	error: string;
};

const PageAuthPinSelect = observer(class PageAuthPinSelect extends React.Component<I.PageComponent, State> {
	
	ref: any = null;
	state = {
		error: ''
	};

	constructor (props: I.PageComponent) {
        super(props);

		this.onSuccess = this.onSuccess.bind(this);
	};
	
	render () {
		const { cover } = commonStore;
		const { error } = this.state;
		
        return (
			<div>
				<Cover {...cover} className="main" />
				<Header {...this.props} component="authIndex" />
				<Footer {...this.props} component="authIndex" />
				
				<Frame>
					<Title text={translate('authPinSelectTitle')} />
					<Label text={translate('authPinSelectLabel')} />
					<Error text={error} />
					
					<Pin ref={(ref: any) => { this.ref = ref; }} onSuccess={this.onSuccess} />
				</Frame>
			</div>
		);
    };

	componentDidMount () {
		this.rebind();
	};

	componentWillUnmount () {
		this.unbind();
	};

	unbind () {
		$(window).off('focus.pin');
	};

	rebind () {
		this.unbind();
		$(window).on('focus.pin', () => { this.ref.focus(); });
	};

	onSuccess (pin: string) {
		const { match } = this.props;

		authStore.pinSet(pin);
		Util.route('/auth/pin-confirm/' + match.params.id);
	};
	
});

export default PageAuthPinSelect;