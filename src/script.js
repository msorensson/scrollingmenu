'use strict';
import HorizontalScrollingMenu from './HorizontalScrollingMenu';

const example1 = document.getElementById('example-1');
new HorizontalScrollingMenu(example1);

const example2 = document.getElementById('example-2');
new HorizontalScrollingMenu(example2, {
    navigation: true
});

const example3 = document.getElementById('example-3');
new HorizontalScrollingMenu(example3, {
    navigation: true,
    drag: true
});
