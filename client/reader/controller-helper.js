/** @format */
/**
 * External Dependencies
 */
import i18n from 'i18n-calypso';
import moment from 'moment';

/**
 * Internal Dependencies
 */
import analytics from 'lib/analytics';
import { recordTrack } from 'reader/stats';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';

export function trackPageLoad( path, title, readerView ) {
	analytics.pageView.record( path, title );
	analytics.mc.bumpStat(
		'reader_views',
		readerView === 'full_post' ? readerView : readerView + '_load'
	);
}

export function getStartDate( context ) {
	if ( context.query && context.query.at ) {
		const startDate = moment( context.query.at );
		return startDate.isValid() ? startDate.toISOString() : null;
	}

	return null;
}

export function trackScrollPage( path, title, category, readerView, pageNum ) {
	analytics.ga.recordEvent( category, 'Loaded Next Page', 'page', pageNum );
	recordTrack( 'calypso_reader_infinite_scroll_performed', {
		path: path,
		page: pageNum,
		section: readerView,
	} );
	analytics.pageView.record( path, title );
	analytics.mc.bumpStat( {
		newdash_pageviews: 'scroll',
		reader_views: readerView + '_scroll',
	} );
}

export function trackUpdatesLoaded( key ) {
	analytics.mc.bumpStat( 'reader_views', key + '_load_new' );
	analytics.ga.recordEvent( 'Reader', 'Clicked Load New Posts', key );
	recordTrack( 'calypso_reader_load_new_posts', {
		section: key,
	} );
}

export function setPageTitle( context, title ) {
	// @todo Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch(
		setTitle(
			i18n.translate( '%s ‹ Reader', {
				args: title,
				comment: '%s is the section name. For example: "My Likes"',
			} )
		)
	);
}

export function userHasHistory( context ) {
	return !! context.lastRoute;
}
