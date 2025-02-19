<?php
/**
 * Utility functions for jetpack-mu-wpcom.
 *
 * @package automattic/jetpack-mu-wpcom
 */

use Automattic\Jetpack\Jetpack_Mu_Wpcom;

/**
 * Helper function to return the site slug for Calypso URLs.
 * The fallback logic here is derived from the following code:
 *
 * @see https://github.com/Automattic/wc-calypso-bridge/blob/85664e2c7836b2ddc29e99871ec2c5dc4015bcc8/class-wc-calypso-bridge.php#L227-L251
 *
 * @return string
 */
function wpcom_get_site_slug() {
	if ( defined( 'IS_WPCOM' ) && IS_WPCOM && class_exists( 'WPCOM_Masterbar' ) && method_exists( 'WPCOM_Masterbar', 'get_calypso_site_slug' ) ) {
		return WPCOM_Masterbar::get_calypso_site_slug( get_current_blog_id() );
	}

	// The Jetpack class should be auto-loaded if Jetpack has been loaded,
	// but we've seen fatal errors from cases where the class wasn't defined.
	// So let's make double-sure it exists before calling it.
	if ( class_exists( '\Automattic\Jetpack\Status' ) ) {
		$jetpack_status = new \Automattic\Jetpack\Status();

		return $jetpack_status->get_site_suffix();
	}

	// If the Jetpack Status class doesn't exist, fall back on site_url()
	// with any trailing '/' characters removed.
	$site_url = untrailingslashit( site_url( '/', 'https' ) );

	// Remove the leading 'https://' and replace any remaining `/` characters with ::
	return str_replace( '/', '::', substr( $site_url, 8 ) );
}

/**
 * Returns the Calypso domain that originated the current request.
 *
 * @return string
 */
function wpcom_get_calypso_origin() {
	$origin  = ! empty( $_GET['calypso_origin'] ) ? wp_unslash( $_GET['calypso_origin'] ) : 'https://wordpress.com'; // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
	$allowed = array(
		'http://calypso.localhost:3000',
		'http://127.0.0.1:41050', // Desktop App.
		'https://wpcalypso.wordpress.com',
		'https://horizon.wordpress.com',
		'https://wordpress.com',
	);
	return in_array( $origin, $allowed, true ) ? $origin : 'https://wordpress.com';
}

/**
 * Returns the Calypso domain that originated the current request.
 *
 * @param string $asset_name The name of the asset.
 * @param array  $asset_types The types of the asset.
 */
function jetpack_mu_wpcom_enqueue_assets( $asset_name, $asset_types = array() ) {
	$asset_file = include Jetpack_Mu_Wpcom::BASE_DIR . "build/$asset_name/$asset_name.asset.php";

	if ( in_array( 'js', $asset_types, true ) ) {
		$js_file = "build/$asset_name/$asset_name.js";
		wp_enqueue_script(
			"jetpack-mu-wpcom-$asset_name-script",
			plugins_url( $js_file, Jetpack_Mu_Wpcom::BASE_FILE ),
			$asset_file['dependencies'] ?? array(),
			$asset_file['version'] ?? filemtime( Jetpack_Mu_Wpcom::BASE_DIR . $js_file ),
			true
		);
	}

	if ( in_array( 'css', $asset_types, true ) ) {
		$css_ext  = is_rtl() ? 'rtl.css' : 'css';
		$css_file = "build/$asset_name/$asset_name.$css_ext";
		wp_enqueue_style(
			"jetpack-mu-wpcom-$asset_name-style",
			plugins_url( $css_file, Jetpack_Mu_Wpcom::BASE_FILE ),
			array(),
			filemtime( Jetpack_Mu_Wpcom::BASE_DIR . $css_file )
		);
	}
}
