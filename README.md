# react-svg-ikon

Opinionated React component for caching and displaying SVG Icons.

## Installation

`> yarn add react-svg-ikon`

Requires `react`, `react-dom`, `aphrodite` and `recompose` as peerDependencies.

## Usage

### SVG Files

SVG icons need to follow some simple rules to be compatible:

* The `svg` element must have width, height and viewbox attrbutes defined.
* There must be a `g` element with an id somewhere, preferably the outermost group. The id must start with `icon-` (this will be made less strict in a future release)
* Remove fill and stroke attrbutes where you want dynamic coloring

Example svg file:

```
<?xml version="1.0" encoding="UTF-8"?>
<svg width="14px" height="9px" viewBox="0 0 14 9" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="icon-polygon" class="icon icon-polygon" stroke-width="1" fill-rule="evenodd" stroke-linecap="round">
        <g transform="translate(-271.000000, -21.000000)" stroke-width="2">
            <g transform="translate(272.000000, 22.000000)">
                <polyline points="1.000 2.000 3.000 Z"></polyline>
            </g>
        </g>
    </g>
</svg>
```

### React component

```
import Icon from 'react-svg-ikon';
import svgImg from '../img/some-svg.svg';

...

<Icon src={ svgImg } fill="red" />
<Icon src={ svgImg } stroke="red" />
<Icon src={ svgImg } className={ css( redIcon ) } />
<Icon src="/static/img/foo.svg" fill="#ff0000" />

```
