"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var Expressions = {
    BasePath: /[\/]+[^\w\d\s]/i,
    CheckUrlPlaceholder: /([:*])(\w+)/g
};
var SwouterSettings = {
    defaultRoute: 'home',
    templateFolder: '/templates/',
    templateExtension: '.php',
    routesApiUrl: '',
    apiCooldown: 10000,
    baseUrl: '',
    routerBox: document.querySelector('route-host'),
    title: {
        prefix: '',
        prefixSeparator: '',
        suffix: '',
        suffixSeparator: ''
    },
    errors: {
        e404: 'error.404'
    }
};
var SwouterCurrent = {
    id: '',
    params: {}
};
var SwouterHistory = [];
var SwouterConfigLastChecked = 0;
var SwouterRoutes = [];
var RouterBoxFilled = new CustomEvent('RouterBoxFilled');
function $__Handle__PopState() {
    window.addEventListener('popstate', function (Evn) {
        if (null !== Evn.state)
            Navigate(Evn.state.RouteID, Evn.state.RouteParameter, false, 'Backwards');
        else
            history.back();
        Evn.preventDefault();
    });
}
function $__Handle__HashChange() {
    window.addEventListener('hashchange', function (Evn) {
        Evn.preventDefault();
    });
}
function $__Handle__BeforeUnload() {
    window.addEventListener('beforeunload', function (Evn) {
        Evn.preventDefault();
    });
}
function $__Register__LinkTags() {
    var LinkTags = document.querySelectorAll('[sgo]');
    LinkTags.forEach(function (Link) {
        var LinkRoute = Link.getAttribute('sgo');
        var LinkParameter = (Link.getAttribute('sparam') || {});
        Link.onclick = function (Evn) {
            Navigate(LinkRoute, LinkParameter);
            Link.blur();
            window.scrollTo(0, 400);
            Evn.preventDefault();
        };
    });
}
function SetActive(ActivatingLink) {
    var ActiveNavbarLinks = document.querySelectorAll('.mb-link.active');
    ActiveNavbarLinks.forEach(function (ActiveNavbarLink) { return ActiveNavbarLink.classList.remove('active'); });
    ActivatingLink.classList.add('active');
    return ActivatingLink;
}
function ResolveRoute() {
    return __awaiter(this, void 0, void 0, function () {
        var Path, SortMark, DidMatch, MatchingRoute, Routes, Params_1, Schema, ParamsMatcher, ParamKeys, ParamValues_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    Path = location.pathname;
                    SortMark = new RegExp("^" + Path.split('/')[1], 'gi');
                    DidMatch = false;
                    MatchingRoute = SwouterSettings.errors.e404;
                    return [4, GetRoutes()];
                case 1:
                    Routes = _a.sent();
                    return [4, Object.keys(Routes)
                            .sort(function (A) {
                            if (SortMark.test(A))
                                return -1;
                            else
                                return 1;
                        })
                            .every(function (RouteID) {
                            var Route = Routes[RouteID];
                            var RouteSchema = Route.schema;
                            var ComparisonMatch;
                            if (1 === Route.strict)
                                ComparisonMatch = new RegExp(RouteSchema.replace(/(:([^(,\/.).]+))/gi, '(.+)') + '\/?([^\/<>]+)?\/?$', 'i');
                            else
                                ComparisonMatch = new RegExp(RouteSchema.replace(/(:([^(,\/.).]+))/gi, '(.+)') + '\/?([^\/<>]+)?\/?', 'i');
                            if (ComparisonMatch.test(Path)) {
                                DidMatch = true;
                                MatchingRoute = RouteID;
                                SwouterCurrent.id = RouteID;
                                return false;
                            }
                            return true;
                        })];
                case 2:
                    _a.sent();
                    if (DidMatch) {
                        Params_1 = {};
                        Schema = Routes[MatchingRoute]['schema'];
                        ParamsMatcher = new RegExp(Schema.replace(/(:([^(,\/.).]+))/gi, '(.+)'), 'i');
                        ParamKeys = ParamsMatcher.exec(Schema);
                        ParamValues_1 = ParamsMatcher.exec(Path);
                        if (ParamValues_1)
                            ParamKeys.forEach(function (Key, KeyIndex) {
                                Key = Key.replace(/([^\w\d])+/gi, '');
                                if (Path !== ParamValues_1[KeyIndex])
                                    Params_1[Key] = ParamValues_1[KeyIndex];
                            });
                        Navigate(MatchingRoute, Params_1, false, 'Resolve');
                    }
                    if (!DidMatch)
                        Navigate(SwouterSettings.errors.e404);
                    return [2];
            }
        });
    });
}
function Init(SwouterSettingsObject) {
    if (SwouterSettingsObject === void 0) { SwouterSettingsObject = {}; }
    $__Handle__HashChange();
    $__Handle__PopState();
    $__Handle__BeforeUnload();
    $__Register__LinkTags();
    Settings(SwouterSettingsObject);
    GetRoutes(true);
    var Path = window.location.pathname;
    var PatchBasePath = Expressions.BasePath;
    if (!(!PatchBasePath.test(Path) && '/' !== Path))
        Navigate(SwouterSettings.defaultRoute, {}, false, 'Initialization');
    else
        ResolveRoute();
}
exports.Init = Init;
function SetTitle() {
    return __awaiter(this, void 0, void 0, function () {
        var RouteID, RouteParams, PresetTitle, Title;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    RouteID = SwouterCurrent.id;
                    RouteParams = SwouterCurrent.params;
                    return [4, GetRoutes().then(function (Response) {
                            return Response[RouteID].title;
                        })];
                case 1:
                    PresetTitle = _a.sent();
                    Object.keys(RouteParams).forEach(function (Param) {
                        PresetTitle = PresetTitle.replace(['{{', Param, '}}'].join(''), RouteParams[Param]);
                    });
                    Title = [
                        SwouterSettings.title.prefix,
                        SwouterSettings.title.prefixSeparator,
                        PresetTitle,
                        SwouterSettings.title.suffixSeparator,
                        SwouterSettings.title.suffix
                    ].join('\u0020');
                    document.title = Title;
                    return [2, document.title];
            }
        });
    });
}
function GetRoutes(ForceFetch) {
    if (ForceFetch === void 0) { ForceFetch = false; }
    return __awaiter(this, void 0, void 0, function () {
        var CurrentTime, LastChecked, TimeDifference;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!SwouterSettings.routesApiUrl)
                        throw '[Swouter] SwouterSettings.routesApiUrl is not set, please set the default via Settings({routesApiUrl:"<Your Url here>"})';
                    CurrentTime = new Date().getTime();
                    LastChecked = SwouterConfigLastChecked;
                    TimeDifference = CurrentTime - LastChecked;
                    if (!ForceFetch && SwouterSettings.apiCooldown > TimeDifference)
                        return [2, SwouterRoutes];
                    return [4, fetch(SwouterSettings.routesApiUrl)
                            .then(function (Response) {
                            return Response.json();
                        })
                            .then(function (Response) {
                            SwouterRoutes = Response;
                            SwouterConfigLastChecked = CurrentTime;
                            return SwouterRoutes;
                        })];
                case 1: return [2, _a.sent()];
            }
        });
    });
}
exports.GetRoutes = GetRoutes;
function Settings(SettingsObject) {
    SwouterSettings = __assign({}, SwouterSettings, SettingsObject);
    return SwouterSettings;
}
exports.Settings = Settings;
function Navigate(RouteID, RouteParameter, ForceGetRoutes, Activation) {
    if (RouteParameter === void 0) { RouteParameter = {}; }
    if (ForceGetRoutes === void 0) { ForceGetRoutes = false; }
    if (Activation === void 0) { Activation = 'default'; }
    return __awaiter(this, void 0, void 0, function () {
        var Route, Path;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, GetRoutes(ForceGetRoutes)
                        .then(function (Response) {
                        if (Response && Response[RouteID])
                            return Response[RouteID];
                        else if (Response && !Response[RouteID] && (RouteID = SwouterSettings.errors.e404))
                            return Response[SwouterSettings.errors.e404];
                        else
                            throw alert("Please contact the administrator!\nSwouter was unable to fetch the Routes API.");
                    })];
                case 1:
                    Route = _a.sent();
                    return [4, MakePath(RouteID, RouteParameter)];
                case 2:
                    Path = _a.sent();
                    SwouterCurrent.id = RouteID;
                    SwouterCurrent.params = RouteParameter;
                    return [4, SetTitle()];
                case 3:
                    _a.sent();
                    if (-1 >= ['Backwards', 'Forwards'].indexOf(Activation))
                        history.pushState(__assign({ RouteID: RouteID, RouteParameter: RouteParameter }, Route), document.title, [location.origin, Path].join(''));
                    else if (-1 >= ['Initialization', 'Resolve'].indexOf(Activation))
                        history.replaceState(__assign({ RouteID: RouteID, RouteParameter: RouteParameter }, Route), document.title, [location.origin, Path].join(''));
                    return [4, fetch([SwouterSettings.templateFolder, Route['templateUrl'], SwouterSettings.templateExtension].join(''))
                            .then(function (Response) {
                            return Response.text();
                        })
                            .then(function (Response) {
                            var Output = Response;
                            Output = Output.replace(/<\/?script>/gi, '');
                            Output = Output.replace(/\n/gi, ' ');
                            Output = Output.replace(/>\s+</gi, '><');
                            return Output;
                        })
                            .then(function (Response) {
                            var NavbarRelativeButton = document.querySelector(".mb-link[sgo=\"" + RouteID.split('.')[0] + "\"]");
                            if (NavbarRelativeButton)
                                SetActive(NavbarRelativeButton);
                            SwouterSettings.routerBox.innerHTML = Response;
                        })];
                case 4:
                    _a.sent();
                    dispatchEvent(RouterBoxFilled);
                    return [2, SwouterCurrent];
            }
        });
    });
}
exports.Navigate = Navigate;
function Handle(RouteID, Callbacks) {
    if ('*' === RouteID)
        window.addEventListener('RouterBoxFilled', function () { return Callbacks.forEach(function (Callback) { return Callback(); }); });
    else
        window.addEventListener('RouterBoxFilled', function () {
            if (RouteID === SwouterCurrent.id)
                Callbacks.forEach(function (Callback) { return Callback(); });
        });
}
exports.Handle = Handle;
function HandleM(Handles) {
    Handles.forEach(function (Handler) { return Handle(Handler[0], Handler[1]); });
}
exports.HandleM = HandleM;
function GetCurrent() {
    return SwouterCurrent;
}
exports.GetCurrent = GetCurrent;
function MakePath(RouteID, RouteParameter) {
    if (RouteParameter === void 0) { RouteParameter = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var Route, Path, CheckUrlPlaceholder;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, GetRoutes()
                        .then(function (Response) {
                        if (Response && Response[RouteID])
                            return Response[RouteID];
                        else if (Response && !Response[RouteID] && (RouteID = SwouterSettings.errors.e404))
                            return Response[SwouterSettings.errors.e404];
                        else
                            throw alert("Please contact the administrator!\nSwouter was unable to fetch the Routes API.");
                    })];
                case 1:
                    Route = _a.sent();
                    Path = Route['schema'];
                    CheckUrlPlaceholder = new RegExp(Expressions.CheckUrlPlaceholder);
                    if (CheckUrlPlaceholder.test(Path))
                        Object.keys(RouteParameter).forEach(function (Param) {
                            Path = Path.replace([':', Param].join(''), RouteParameter[Param]);
                        });
                    return [2, Path];
            }
        });
    });
}
exports.MakePath = MakePath;
