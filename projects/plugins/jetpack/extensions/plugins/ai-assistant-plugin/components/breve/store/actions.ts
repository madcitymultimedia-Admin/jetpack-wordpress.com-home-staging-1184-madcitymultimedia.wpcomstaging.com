/**
 * External dependencies
 */
import { select } from '@wordpress/data';

// ACTIONS

export function setHighlightHover( isHover: boolean ) {
	return {
		type: 'SET_HIGHLIGHT_HOVER',
		isHover,
	};
}

export function setPopoverHover( isHover: boolean ) {
	return {
		type: 'SET_POPOVER_HOVER',
		isHover,
	};
}

export function setPopoverAnchor( anchor: HTMLElement | EventTarget ) {
	return {
		type: 'SET_POPOVER_ANCHOR',
		anchor,
	};
}

export function toggleProofread( force?: boolean ) {
	const current = select( 'jetpack/ai-breve' ).isProofreadEnabled();
	const enabled = force === undefined ? ! current : force;

	return {
		type: 'SET_PROOFREAD_ENABLED',
		enabled,
	};
}

export function toggleFeature( feature: string, force?: boolean ) {
	const current = select( 'jetpack/ai-breve' ).isFeatureEnabled( feature );
	const enabled = force === undefined ? ! current : force;

	return {
		type: enabled ? 'ENABLE_FEATURE' : 'DISABLE_FEATURE',
		feature,
	};
}
