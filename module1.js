define('module1', ['module2'], function (module2) {
    console.log('module1.js callled');
    return 'module1 result'
})