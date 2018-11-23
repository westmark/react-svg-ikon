import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const iconLib = {};
const widthHeightRe = /<svg width="([^"]+)" height="([^"]+)"/;
const viewBoxRe = /viewBox="([^"]+)"/;
const idRe = /<g id="(icon-[^"]+)"/;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${ ( p ) => p.color };
`;

const ErrorContainer = styled.div`
  width: 2rem;
  height: 2rem;
  border: 1px solid #999999;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default class Icon extends React.Component {
  constructor( props ) {
    super( props );
    this.state = {
      iconMeta: null,
    };
  }

  async componentDidMount() {
    const { src } = this.props;

    if ( Reflect.has( iconLib, src ) ) {
      // If the value is a promise, the icon is being fetched. Wait for it
      if ( typeof iconLib[ src ].then === 'function' ) {
        await iconLib[ src ];
      }
      this.setState( { iconMeta: iconLib[ src ] } );
    } else {
      iconLib[ src ] = fetch( src, {
        method: 'GET',
        credentials: 'include',
        headers: { accept: 'image/webp,image/apng,image/*,*/*;q=0.8' },
      } );

      const response = await iconLib[ src ];
      const contents = await response.text();

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
        this.setState( { iconMeta: meta } );
      }
    }
  }

  render() {
    const { color, className, style } = this.props;
    const { iconMeta } = this.state;
    if ( !iconMeta ) {
      return null;
    }

    if ( iconMeta.error ) {
      return <ErrorContainer>?</ErrorContainer>;
    }

    const svgStyle = {
      width: iconMeta.width,
      height: iconMeta.height,
    };

    return (
      <Container color={ color } className={ className }>
        <svg viewBox={ iconMeta.viewBox } style={ { ...svgStyle, ...style } }>
          <use xlinkHref={ `#${ iconMeta.id }` } />
        </svg>
      </Container>
    );
  }
}

Icon.propTypes = {
  src: PropTypes.string.isRequired,
  color: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

Icon.defaultProps = {
  color: 'black',
  className: null,
  style: {},
};
