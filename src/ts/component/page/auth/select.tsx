import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Frame, Cover, Title, Label, Error, Input, Button, HeaderAuth as Header, FooterAuth as Footer } from 'ts/component';
import { I, Storage, translate, C } from 'ts/lib';
import { commonStore, authStore } from 'ts/store';
import { observer } from 'mobx-react';

interface Props extends RouteComponentProps<any> {};
interface State {
	error: string;
};

@observer
class PageAuthSelect extends React.Component<Props, State> {

	state = {
		error: ''
	};

	constructor (props: any) {
        super(props);

		this.onLogin = this.onLogin.bind(this);
		this.onRegister = this.onRegister.bind(this);
	};
	
	render () {
		const { cover } = commonStore;
		const { error } = this.state;
		
        return (
			<div>
				<Cover {...cover} />
				<Header />
				<Footer />
				
				<Frame>
					<Title text={translate('authSelectTitle')} />
					<Label text={translate('authSelectLabel')} />
					<Error text={error} />
								
					<div className="buttons">
						<Button text={translate('authSelectLogin')} type="input" className="orange" onClick={this.onLogin} />
						<Button text={translate('authSelectSignup')} type="input" className="grey" onClick={this.onRegister} />
					</div>
				</Frame>
			</div>
		);
    };

	onLogin (e: any) {
		this.props.history.push('/auth/login');
	};
	
	onRegister (e: any) {
		const { history } = this.props;
		const { path } = authStore;
		
		C.WalletCreate(path, (message: any) => {
			if (message.error.code) {
				this.setState({ error: message.error.description });
			} else {
				authStore.phraseSet(message.mnemonic);
				history.push('/auth/register/register');
			};
		});
	};
	
};

export default PageAuthSelect;