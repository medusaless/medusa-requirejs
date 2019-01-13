var define, require;

(function () {
    var context = {
        globalDefmodules: {},
        basePath: './'
    };

    var scriptParentElem = document.getElementsByTagName('head')[0];

    function getModulePath(relativePath) {
        return context.basePath + '/' + relativePath + '.js';
    }

    function Module(name, deps, callback) {
        this.name = name;
        this.deps = deps;
        this.depModules = [];
        this.parentModule;
        this.isTagCreated = false;
        this.callback = callback;
        this.loaded = false;
        this.result;
    }

    Module.prototype = {
        constructor: Module,
        depModuleReady() {
            var parentModule = this.parentModule;
            if (parentModule) {
                if (parentModule.isAllDepModulesLoaded()) {
                    parentModule.loaded = true;
                    parentModule.result = getModuleResult(parentModule);
                    parentModule.depModuleReady();
                }
            }
        },
        isAllDepModulesLoaded() {
            return !this.depModules.some(function (module) {
                return module.loaded == false;
            })
        }
    }

    function registerModule(name, deps, callback) {
        var module = getModuleByName(name);

        // register module
        if (!module) {
            module = context.globalDefmodules[name] = new Module(name, deps, callback);
        } else {
            module.deps = deps;
            module.callback = callback;
        }

        // register dep modules
        registerDepModules(deps, module);
    }

    function registerDepModules(deps, parentModule) {
        for (var i = 0; i < deps.length; i++) {
            var depName = deps[i];
            var depModule = getModuleByName(depName);
            if (!depModule) {
                depModule = context.globalDefmodules[depName] = new Module(depName);
                depModule.parentModule = parentModule;
                parentModule.depModules.push(depModule);
            }
        }
    }

    function getModuleByName(name) {
        return context.globalDefmodules[name];
    }

    function appendModuleScript(depsNames) {
        for (var i = 0; i < depsNames.length; i++) {
            createScriptElement(depsNames[i]);
        }
    }

    require = function (deps, callback) {
        registerModule('__rootModule__', deps, callback);
        appendModuleScript(deps);
    }

    define = function (name, depsNames, callback) {
        // no dep, execute callback and get result
        if (depsNames.length === 0) {
            var module = getModuleByName(name);
            module.callback = callback;
            module.result = getModuleResult(module);
            module.loaded = true;
            module.depModuleReady();
        } else {
            // has dep, register module and its deps
            registerModule(name, depsNames, callback);
            appendModuleScript(depsNames);
        }
    }

    function getModuleResult(module) {
        return module.callback.apply(
            this,
            module.depModules.map(function (module) {
                return module.result;
            })
        )
    }

    function createScriptElement(name) {
        var elem = document.createElement('script');
        elem.setAttribute('data-module-name', name);
        elem.setAttribute('src', getModulePath(name));
        elem.setAttribute('async', true);
        scriptParentElem.appendChild(elem);
    }

    var scripts = document.getElementsByTagName('script');
    var sLength = scripts.length;
    var mainJs;
    for (var i = 0; i < sLength; i++) {
        var name = scripts[i].getAttribute("data-main");
        if (name) {
            mainJs = name;
            break;
        }
    }

    var mainScript = document.createElement('script');
    mainScript.src = mainJs;
    scriptParentElem.appendChild(mainScript);
})();
