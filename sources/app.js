import './app.scss';
import html from './app.html';

import Renderer from './app/renderer.js';

document.body.innerHTML = html;

var app = new Renderer('foo');

