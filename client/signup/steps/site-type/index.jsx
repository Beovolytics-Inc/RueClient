/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import hasInitializedSites from 'state/selectors/has-initialized-sites';
import Button from 'components/button';
import SiteTypeForm from './form';
import StepWrapper from 'signup/step-wrapper';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import { submitSiteType } from 'state/signup/steps/site-type/actions';
import { saveSignupStep } from 'state/signup/progress/actions';
import { recordTracksEvent } from 'state/analytics/actions';

const siteTypeToFlowname = {
	import: 'import-onboarding',
	'online-store': 'ecommerce-onboarding',
};

class SiteType extends Component {
	componentDidMount() {
		this.props.saveSignupStep( { stepName: this.props.stepName } );
	}

	handleImportFlowClick = () => {
		this.props.recordTracksEvent( 'calypso_signup_import_cta_click', {
			flow: this.props.flowName,
			step: this.props.stepName,
		} );
		this.submitStep( 'import' );
	};

	submitStep = siteTypeValue => {
		this.props.submitSiteType( siteTypeValue );

		// Modify the flowname if the site type matches an override.
		let flowName;
		if ( 'import-onboarding' === this.props.flowName ) {
			flowName = siteTypeToFlowname[ siteTypeValue ] || 'onboarding';
		} else {
			flowName = siteTypeToFlowname[ siteTypeValue ] || this.props.flowName;
		}

		this.props.goToNextStep( flowName );
	};

	renderImportButton() {
		if ( 'show' !== abtest( 'showImportFlowInSiteTypeStep' ) ) {
			return null;
		}

		return (
			<div className="site-type__import-button">
				<Button borderless onClick={ this.handleImportFlowClick }>
					{ this.props.translate( 'Already have a website? Import your content here.' ) }
				</Button>
			</div>
		);
	}

	renderStepContent() {
		const { siteType } = this.props;

		return (
			<Fragment>
				<SiteTypeForm
					goToNextStep={ this.props.goToNextStep }
					submitForm={ this.submitStep }
					siteType={ siteType }
				/>
				{ this.renderImportButton() }
			</Fragment>
		);
	}

	render() {
		const {
			flowName,
			positionInFlow,
			stepName,
			translate,
			hasInitializedSitesBackUrl,
		} = this.props;

		const headerText = translate( 'What kind of site are you building?' );
		const subHeaderText = translate(
			'This is just a starting point. You can add or change features later.'
		);

		return (
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				headerText={ headerText }
				fallbackHeaderText={ headerText }
				subHeaderText={ subHeaderText }
				fallbackSubHeaderText={ subHeaderText }
				stepContent={ this.renderStepContent() }
				allowBackFirstStep={ !! hasInitializedSitesBackUrl }
				backUrl={ hasInitializedSitesBackUrl }
				backLabelText={ hasInitializedSitesBackUrl ? translate( 'Back to My Sites' ) : null }
			/>
		);
	}
}

export default connect(
	state => ( {
		siteType: getSiteType( state ) || 'blog',
		hasInitializedSitesBackUrl: hasInitializedSites( state ) ? '/sites/' : false,
	} ),
	{ recordTracksEvent, saveSignupStep, submitSiteType }
)( localize( SiteType ) );
