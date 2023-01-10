import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import { Icon, IconObject, Switch } from 'Component';
import { I } from 'Lib';

interface Props extends I.MenuItem {};

class MenuItemVertical extends React.Component<Props, object> {

	render () {
		let { 
			id, icon, object, inner, name, description, caption, color, arrow, checkbox, isActive, withDescription, withCaption, withSwitch, 
			className, style, iconSize, switchValue, readonly, forceLetter, onClick, onSwitch, onMouseEnter, onMouseLeave,
		} = this.props;
		let cn = [ 'item' ];

		if (className) {
			cn.push(className);
		};
		if (color) {
			cn.push(color + ' withColor');
		};
		if (arrow) {
			cn.push('withChildren');
		};
		if (withDescription) {
			cn.push('withDescription');
		};
		if (withCaption) {
			cn.push('withCaption');
		};
		if (withSwitch) {
			cn.push('withSwitch');
		};
		if (checkbox) {
			cn.push('withCheckbox');
		};
		if (isActive) {
			cn.push('active');
		};
		if (readonly) {
			cn.push('isReadonly');
		};

		let iconElement = null;
		if (object) {
			iconElement = <IconObject object={object} size={iconSize} forceLetter={forceLetter} />;

			if (object.isHidden) {
				cn.push('isHidden');
			};
		} else 
		if (icon) {
			cn.push('withIcon');
			iconElement = <Icon className={[ icon, 'iconMain' ].join(' ')} inner={inner} />;
		};

		let content = null;
		if (withDescription) {
			content = (
				<React.Fragment>
					{iconElement}
					<div className="info">
						<div className="txt">
							<div className="name">{name}</div>
							<div className="descr">{description}</div>
						</div>
					</div>
				</React.Fragment>
			);
		} else {
			if (withSwitch) {
				content = (
					<React.Fragment>
						<div className="clickable" onMouseDown={onClick}>
							{iconElement}
							<div className="name">{name}</div>
						</div>
						<Switch 
							value={switchValue} 
							readonly={readonly}
							onChange={(e: any, v: boolean) => { 
								if (onSwitch) {
									onSwitch(e, v); 
								};
							}} 
						/>
					</React.Fragment>
				);
			} else {
				content = (
					<React.Fragment>
						{iconElement}
						<div className="name">{name}</div>
						{withCaption ? (
							<React.Fragment>
								{'string' == typeof(caption) ? (
									<div className="caption" dangerouslySetInnerHTML={{ __html: caption }} />
								) : (
									<div className="caption">{caption}</div>
								)}
							</React.Fragment>
						) : ''}
					</React.Fragment>
				);
			};
		};

		return (
			<div 
				id={'item-' + id} 
				className={cn.join(' ')} 
				onMouseDown={!withSwitch ? onClick : undefined} 
				onMouseEnter={onMouseEnter} 
				onMouseLeave={onMouseLeave} 
				style={style}
			>
				{content}
				{arrow ? <Icon className="arrow" /> : ''}
				{checkbox ? <Icon className="chk" /> : ''}
			</div>
		);
    };

	componentDidMount () {
		this.resize();
	};

	componentDidUpdate () {
		this.resize();
	};

	resize () {
		const node = $(this.node);
		
		if (node.hasClass('withIcon')) {
			return;
		};

		const icon = node.find('.iconObject');
		icon.length ? node.addClass('withIconObject') : node.removeClass('withIconObject');
	};

};

export default MenuItemVertical;