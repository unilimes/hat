import './foo.scss';
import html from './foo.html';
import json from './foo.json';

import basicVertex from './../shaders/basic/vertex.glsl';
import basicFragment from './../shaders/basic/fragment.glsl';

export default function render(selector) {
    document.querySelector(selector).innerHTML = html;

    console.log(json);
    console.log(basicVertex);
    console.log(basicFragment);

    console.log('foo js logic - test');
}
