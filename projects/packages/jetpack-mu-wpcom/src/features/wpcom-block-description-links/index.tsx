import { createInterpolateElement } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { JSXElementConstructor, ReactElement } from 'react';
import blockInfoMapping, {
	blockInfoWithVariations,
	childrenBlockInfoWithDifferentUrl,
} from './src/block-links-map';
import DescriptionSupportLink from './src/inline-support-link';

const createLocalizedDescriptionWithLearnMore = (
	title: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	description: string | ReactElement< string | JSXElementConstructor< any > >,
	url: string,
	postId: number
) => {
	return createInterpolateElement( '<InlineSupportLink />', {
		InlineSupportLink: (
			<DescriptionSupportLink title={ String( title ) } url={ url } postId={ postId }>
				{ description }
			</DescriptionSupportLink>
		),
	} );
};

const processedBlocks: { [ key: string ]: true } = {};

const addBlockSupportLinks = (
	settings: {
		variations: Array< {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			description: string | ReactElement< string | JSXElementConstructor< any > >;
			name: string;
			title: string;
		} >;
	} & {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		[ key: string ]: string | ReactElement< string | JSXElementConstructor< any > >;
	},
	name: string
) => {
	// If block has a parent, use the parents name in the switch. This will apply the link to all nested blocks.
	// The exception is "post content" block because it's used to allow blocks like "more" and "jetpack/paywall" only in post content areas & post editor
	// `parent` is actually an array of strings, so converting to string is going to join multiple blocks together, making the method buggy.
	const parentName = settings?.parent?.toString();
	const isChild = parentName && parentName !== 'core/post-content';
	const blockName = isChild ? parentName : name;

	/**
	 * This is needed because the `blocks.registerBlockType` filter is also triggered for deprecations.
	 *
	 * When the block has deprecations, this filter is triggered multiple times, resulting the Learn more link being appended multiple times.
	 */
	if ( processedBlocks[ name ] ) {
		return settings;
	}

	processedBlocks[ name ] = true;

	const additonalDescLink =
		childrenBlockInfoWithDifferentUrl[ name ]?.link || blockInfoMapping[ blockName ]?.link;

	const additionalDescPostId =
		childrenBlockInfoWithDifferentUrl[ name ]?.postId || blockInfoMapping[ blockName ]?.postId;

	/**
	 * Some elements are children, but have their own url for Learn More, and we want to show those.
	 */
	if ( additonalDescLink && additionalDescPostId ) {
		settings.description = createLocalizedDescriptionWithLearnMore(
			String( settings.title ),
			settings.description,
			additonalDescLink,
			additionalDescPostId
		);
	}

	if (
		blockInfoWithVariations[ name ] &&
		settings.variations &&
		Array.isArray( settings.variations )
	) {
		settings.variations = settings.variations.map(
			( variation: {
				title: string;
				name: string;
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				description: string | ReactElement< string | JSXElementConstructor< any > >;
			} ) => {
				const link = blockInfoWithVariations[ name ][ variation.name ]?.link;
				const postId = blockInfoWithVariations[ name ][ variation.name ]?.postId;

				if ( ! link ) {
					return variation;
				}

				variation.description = createLocalizedDescriptionWithLearnMore(
					variation.title,
					variation.description,
					link,
					postId
				);

				return variation;
			}
		);
	}

	return settings;
};

addFilter(
	'blocks.registerBlockType',
	'jetpack-mu-wpcom/add-block-support-link',
	addBlockSupportLinks
);
