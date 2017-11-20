import React from 'react';
import PropTypes from 'prop-types';
import { css, StyleSheet } from 'aphrodite';
import compose from 'recompose/compose';
import withState from 'recompose/withState';
import lifecycle from 'recompose/lifecycle';

import './index.css';

export const stylePropType = PropTypes.oneOfType( [
  PropTypes.object,
  PropTypes.arrayOf( PropTypes.object ),
] );

let styles;
const iconLib = {};
const widthHeightRe = /<svg width="([^"]+)" height="([^"]+)"/;
const viewBoxRe = /viewBox="([^"]+)"/;
const idRe = /<g id="(icon-[^"]+)"/;

const enhance = compose(
  withState( 'iconMeta', 'setIconMeta', null ),
  lifecycle( {
    componentWillMount: function componentWillMount() {
      const { src } = this.props;

      if ( Reflect.has( iconLib, src ) ) {
        // If the value is a promise, the icon is being fetched. Wait for it
        if ( typeof iconLib[ src ].then === 'function' ) {
          iconLib[ src ].then( () => this.props.setIconMeta( iconLib[ src ] ) );
        } else {
          // Icon is already loaded
          this.props.setIconMeta( iconLib[ src ] );
        }
      } else {
        iconLib[ src ] = fetch( src, {
          method: 'GET',
          credentials: 'include',
          headers: { accept: 'image/webp,image/apng,image/*,*/*;q=0.8' },
        } )
          .then( ( response ) => response.text() )
          .then( ( contents ) => {
            const vhMatch = contents.match( widthHeightRe );
            const viewBoxMatch = contents.match( viewBoxRe );
            const idMatch = contents.match( idRe );

            const meta = {};
            if ( !idMatch ) {
              // Error case. Not able to show the icon
              meta.error = true;
              return;
            }
            meta.id = idMatch[ 1 ];

            if ( vhMatch ) {
              meta.width = vhMatch[ 1 ];
              meta.height = vhMatch[ 2 ];
            }

            if ( viewBoxMatch ) {
              meta.viewBox = viewBoxMatch[ 1 ];
            } else if ( vhMatch ) {
              meta.viewBox = `0 0 ${ meta.width.replace( 'px', '' ) } ${ meta.height.replace( 'px', '' ) }`;
            } else {
              // Error case. Not able to show the icon
              meta.error = true;
            }

            if ( !meta.error ) {
              let container = document.querySelector( '#react-svg-icon-repo' );
              if ( !container ) {
                container = document.createElement( 'div' );
                container.setAttribute( 'id', 'react-svg-ikon-repo' );
                container.setAttribute( 'style', 'display:none' );
                document.body.appendChild( container );
              }
              container.innerHTML = `${ container.innerHTML } ${ contents }`;
              iconLib[ src ] = meta;
              this.props.setIconMeta( meta );
            }
          } );
      }
    },
  } ),
);

const Icon = ( { iconMeta, style, fill, stroke, className } ) => {
  if ( iconMeta === null ) {
    return null;
  }

  if ( iconMeta.error ) {
    return (
      <div className={ css( styles.errorContainer ) }>?</div>
    );
  }

  const baseClassName = `icon-container ${ fill && !stroke ? 'fill' : '' } ${ stroke ? 'stroke' : '' } ${ className }`;
  let finalStyle;
  if ( stroke ) {
    finalStyle = { color: stroke };
  } else if ( fill ) {
    finalStyle = { color: fill };
  }

  const svgStyle = {
    width: ( style && style.width ) || iconMeta.width,
    height: ( style && style.height ) || iconMeta.height,
  };

  return (
    <div
      className={ `${ baseClassName } ${ css( styles.container, style ) }` }
      style={ finalStyle }
    >
      <svg viewBox={ iconMeta.viewBox } style={ svgStyle }>
        <use xlinkHref={ `#${ iconMeta.id }` } />
      </svg>
    </div>
  );
};

Icon.propTypes = {
  src: PropTypes.string.isRequired, // eslint-disable-line
  iconMeta: PropTypes.shape( {
    viewBox: PropTypes.string.isRequired,
    error: PropTypes.bool,
  } ),
  style: stylePropType,
  fill: PropTypes.string,
  stroke: PropTypes.string,
  className: PropTypes.string,
};

Icon.defaultProps = {
  iconMeta: null,
  style: null,
  fill: null,
  stroke: null,
  className: '',
};

styles = StyleSheet.create( {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  errorContainer: {
    width: '2rem',
    height: '2rem',
    border: '1px solid #999999',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
} );

export default enhance( Icon );
