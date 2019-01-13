define('module2', ['module3'], function (module3) {
    console.log('module2.js called');
    console.log(module3);
    return 'value-module2';
})