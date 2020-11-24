import * as React from 'react';
import { Input, Button } from 'ts/component';
import { I, translate } from 'ts/lib';
import { observer } from 'mobx-react';

interface Props extends I.Popup {
	history: any;
};

@observer
class PopupPrompt extends React.Component<Props, {}> {
	
	refValue: any = null;
	
	constructor(props: any) {
		super(props);
		
		this.onSubmit = this.onSubmit.bind(this);
		this.onCancel = this.onCancel.bind(this);
	};

	render() {
		const { param } = this.props;
		const { data } = param;
		const { placeHolder, value, maxLength } = data;
		
		return (
			<form onSubmit={this.onSubmit}>
				<Input ref={(ref: any) => { this.refValue = ref; }} value={value} placeHolder={placeHolder} maxLength={maxLength} />
				<Button type="input" text={translate('commonOk')} className="orange" />
				<Button text={translate('commonCancel')} className="grey" onClick={this.onCancel} />
			</form>
		);
	};
	
	componentDidMount () {
		const { param } = this.props;
		const { data } = param;
		const { value } = data;
		
		this.refValue.setValue(value);
		this.refValue.focus();
	};
	
	onSubmit (e: any) {
		const { id, param } = this.props;
		const { data } = param;
		const { onChange } = data;
		
		e.preventDefault();
		this.props.close();
		
		if (onChange) {
			onChange(this.refValue.getValue());
		};
	};
	
	onCancel (e: any) {
		this.props.close();
	};
	
};

export default PopupPrompt;