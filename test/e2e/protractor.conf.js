exports.config = {
    seleniumAddress: process.env.WEBDRIVER || 'http://localhost:4444/wd/hub',
    framework: 'mocha',
    mochaOpts: {
        timeout: 300000,
    },
    onPrepare: function () {
        require("babel-register");
    },
    specs: ['dashboard.test.js']
};
