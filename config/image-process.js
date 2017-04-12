'use strict';

const path = require('path');
const pub = path.resolve(__dirname, '../public');

module.exports = {
    path: {
        image: `${pub}${path.sep}i`,
        preview: `${pub}${path.sep}p`
    },
    resize: [
        null,
        [320, 240],
        [640, 480],
        [800, 600],
        [1024, 768],
        [1280, 1024],
        [1600, 1200]
    ],
    rotate: [
        null,
        90,
        -90,
        180
    ],
    preview: [
        null,
        [100, 100],
        [150, 150],
        [200, 200],
        [250, 250],
        [300, 300],
        [400, 400],
        [500, 500]
    ]
};

