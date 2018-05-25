/**
 * Expressions
 * - RegExp Object
 * @namespace
 * @property {RegExp} BasePath
 * @property {RegExp} CheckUrlPlaceholder
 */
const Expressions: any = {
    BasePath: /[\/]+[^\w\d\s]/i,
    CheckUrlPlaceholder: /([:*])(\w+)/g
}

/**
 * SwouterSettings
 * - Settings Object for Swouter
 * @namespace
 * @property {string} defaultRoute
 * @property {string} templateFolder
 * @property {string} templateExtension
 * @property {string} routesApiUrl
 * @property {number} apiCooldown
 * @property {string} baseUrl
 * @property {HTMLElement} routerBox
 * @property {object} title
 * @property {string} title.prefix
 * @property {string} title.prefixSeparator
 * @property {object} title.suffix
 * @property {object} title.suffixSeparator
 * @property {object} errors
 * @property {string<RouteID>} errors.e404
 */
let SwouterSettings: any = {
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

/**
 * SwouterCurrent
 * - Holds information about the current Route
 * @namespace
 * @property {string} id
 * @property {object} params
 */
let SwouterCurrent: any = {
    id: '',
    params: {}
}

/**
 * SwouterHistory
 * - Contains all visited site Routes
 * - Responsible for proper routing
 * @namespace
 */
let SwouterHistory: Array<object> = [];

/**
 * SwouterConfigLastChecked
 * - UNIX Timestamp when GetRoutes was last executed
 * @namespace
 */
let SwouterConfigLastChecked: number = 0;

/**
 * SwouterRoutes
 * - Object carrying all Routes from GetRoutes
 * - May be empty at first
 * @namespace
 */
let SwouterRoutes: Array<object> = [];

/**
 * RouterBoxFilled
 * - Custom Event, emitted when the RouterBox content changes on Route
 * @namespace
 */
let RouterBoxFilled: CustomEvent = new CustomEvent('RouterBoxFilled');



/**
 * $__Handle__PopState
 * - Dispatches Custom Events on EventListeners
 * @returns {void}
 */
function $__Handle__PopState (): void
{window.addEventListener('popstate', (Evn: PopStateEvent) => {

    // Navigate to Previous Page
    if (null !== Evn.state) Navigate(Evn.state.RouteID, Evn.state.RouteParameter, false, 'Backwards');
    // URL Entry Level Reached
    // Go back to Previous Site
    else history.back();

    // Prevent Default Behaviour
    Evn.preventDefault();

})}



/**
 * $__Handle__HashChange
 * - Dispatches Custom Events on EventListeners
 * @returns {void}
 */
function $__Handle__HashChange (): void
{window.addEventListener('hashchange', (Evn: Event) => {


    // Prevent Default Behaviour
    Evn.preventDefault();

})}



/**
 * $__Handle__BeforeUnload
 * - Dispatches Custom Events on EventListeners
 * @returns {void}
 */
function $__Handle__BeforeUnload (): void
{window.addEventListener('beforeunload', (Evn: Event) => {


    // Prevent Default Behaviour
    Evn.preventDefault();

})}



/**
 * $__Register__LinkTags
 * - Registers Links on the Page
 * @returns {void}
 */
function $__Register__LinkTags (): void
{

    // Register all Links
    const LinkTags: NodeListOf<HTMLElement> = document.querySelectorAll('[sgo]');

    // Add Actions to each Link
    (LinkTags as any).forEach((Link: HTMLAnchorElement) => {

        // Get Tag Attributes
        const LinkRoute: string = Link.getAttribute('sgo')
        const LinkParameter: any = (Link.getAttribute('sparam') || {});

        // Link onClick
        Link.onclick = (Evn: Event) => {

            // Navigate to Route
            Navigate(LinkRoute, LinkParameter);
            // Remove focus
            Link.blur()
            // Scroll just beneath Header
            window.scrollTo(0, 400);

            // Prevent Default Behaviour
            Evn.preventDefault();

        };

    });

}



/**
 * SetActive
 * - Asynchronous Function to Activate a Navbar Link
 * - Will remove other deactivate Links
 * @param {HTMLElement} ActivatingLink 
 * @returns {HTMLElement}
 */
function SetActive (ActivatingLink: HTMLElement): HTMLElement
{

    // Get all Elements containing the "active" CSS Class
    const ActiveNavbarLinks: NodeListOf<HTMLElement> = document.querySelectorAll('.mb-link.active') as NodeListOf<HTMLElement>;

    // Remove the "active" CSS Class from all active Elements
    (<any>ActiveNavbarLinks).forEach((ActiveNavbarLink: HTMLElement) => ActiveNavbarLink.classList.remove('active'));

    // Set the "active" CSS Class
    ActivatingLink.classList.add('active');

    // Returns Element that now contains the "active" CSS Class
    return ActivatingLink;

}



/**
 * [ASYNC] ResolveRoute
 * - Resolves the current Route and passes it's ID and Params to SwouterCurrent
 * - Navigates to resolved Route
 * @returns {void}
 */
async function ResolveRoute (): Promise<void>
{

        // Get current Pathname
        const Path: string = location.pathname;
        // Sort Marker
        const SortMark: RegExp = new RegExp(`^${Path.split('/')[1]}`, 'gi');
        
        // Matchmark
        let DidMatch: boolean = false;
        let MatchingRoute: string = SwouterSettings.errors.e404;

        // Get Config
        const Routes: object = await GetRoutes();

        await Object.keys(Routes)
            .sort((A) => {
                if (SortMark.test(A)) return -1;
                else return 1;
            })
            .every((RouteID: string) => {

                // Get Route Configuration
                const Route: any = Routes[RouteID];
                // Get RouteSchema
                const RouteSchema: string = Route.schema;

                // String to Match Agains
                let ComparisonMatch: RegExp;

                // Switch Strict Mode
                // Strict Mode Enabled
                if (1 === Route.strict) ComparisonMatch = new RegExp(RouteSchema.replace(/(:([^(,\/.).]+))/gi, '(.+)') + '\/?([^\/<>]+)?\/?$', 'i');
                // Strict Mode Disabled
                else ComparisonMatch = new RegExp(RouteSchema.replace(/(:([^(,\/.).]+))/gi, '(.+)') + '\/?([^\/<>]+)?\/?', 'i');

                if (ComparisonMatch.test(Path))
                {

                    // Set Route as matched
                    DidMatch = true;
                    MatchingRoute = RouteID;
                    // Send Value to Instance
                    SwouterCurrent.id = RouteID;
                    // End and Exit Loop
                    return false;

                }

                // Next Item in Loop
                return true;

            });

        // Execute on Matching Route
        if (DidMatch)
        {
            
            // Params Object to pass
            let Params: object = {};
            // Route Schema
            let Schema: string = Routes[MatchingRoute]['schema'];
            
            // Prepare RegExp
            const ParamsMatcher: RegExp = new RegExp(Schema.replace(/(:([^(,\/.).]+))/gi, '(.+)'), 'i');

            // Get Array of Param Keys from Route Schema
            let ParamKeys: Array<string> = ParamsMatcher.exec(Schema);
            // Get Array of Param Valeus from URL
            let ParamValues: Array<string> = ParamsMatcher.exec(Path);

            // Add ParamKey to RouteParams Params
            // Assign relative Values to it
            if (ParamValues) ParamKeys.forEach((Key: string, KeyIndex: number) => {

                // Remove any non digit and word characters
                Key = Key.replace(/([^\w\d])+/gi, '');

                // Dismatch on Pathname Match
                if (Path !== ParamValues[KeyIndex]) Params[Key] = ParamValues[KeyIndex];

            });

            // Navigate to Route
            Navigate(MatchingRoute, Params, false, 'Resolve');

        }

        // Log Debug
        if (!DidMatch) Navigate(SwouterSettings.errors.e404);

}



/**
 * Init
 * - Initiates Swouter
 * @param {[SwouterSettingsObject]} SwouterSettingsObject See Swouter.Settings for more Information
 * @returns {void}
 */
export function Init (SwouterSettingsObject: object = {}): void
{

    /**#1*/
        $__Handle__HashChange();
        $__Handle__PopState();
        $__Handle__BeforeUnload();
    /**~1*/

    /**#2*/
        $__Register__LinkTags();
    /**~2*/

    // Pass initial Settings
    Settings(SwouterSettingsObject);
    // Get Routes; force it
    GetRoutes(true);

    // Check if we're on a route
    // Send to default Route
    const Path: string = window.location.pathname;
    const PatchBasePath: RegExp = Expressions.BasePath;
    // Test Path against RegExp
    if (!(!PatchBasePath.test(Path) && '/' !== Path)) Navigate(SwouterSettings.defaultRoute, {}, false, 'Initialization');
    // If not matches
    // Resolve current Route
    else ResolveRoute();

}



/**
 * [ASYNC] SetTitle
 * - Changes the Page Title
 * @returns {Promise<string>}
 */
async function SetTitle (): Promise<string>
{
    
    // Get Current ID and Params
    const RouteID: string = SwouterCurrent.id;
    const RouteParams: string = SwouterCurrent.params;

    // Route Title Preset
    let PresetTitle: string = await GetRoutes().then(Response => {
        return Response[RouteID].title;
    });

    // Replace all Params
    Object.keys(RouteParams).forEach(Param => {
        // Replace Placeholder
        PresetTitle = PresetTitle.replace(['{{', Param, '}}'].join(''), RouteParams[Param]);
    });

    // Build Title string
    let Title: string = [
        SwouterSettings.title.prefix,
        SwouterSettings.title.prefixSeparator,
        PresetTitle,
        SwouterSettings.title.suffixSeparator,
        SwouterSettings.title.suffix
    ].join('\u0020');

    // Set Title
    document.title = Title;

    // Return the current Site Title
    return document.title;

}



/**
 * [ASYNC] GetRoutes
 * @param {boolean} ForceFetch Forces Function to freshly fetch Routes (e.g. in case of login with permission change)
 * @returns {Promise<object>}
 */
export async function GetRoutes (ForceFetch: boolean = false): Promise<object>
{

    // If SwouterSettings.routesApiUrl not set
    // Throw Error
    if (!SwouterSettings.routesApiUrl) throw '[Swouter] SwouterSettings.routesApiUrl is not set, please set the default via Settings({routesApiUrl:"<Your Url here>"})';

    // Localize Variables
    const CurrentTime: number = new Date().getTime();
    const LastChecked: number = SwouterConfigLastChecked;
    // Time Difference
    const TimeDifference: number = CurrentTime - LastChecked;

    // Return Rotues Array
    // If ForceFetch isn't TRUE
    // and if the difference is greater than apiCooldown
    if (!ForceFetch && SwouterSettings.apiCooldown > TimeDifference) return SwouterRoutes;

    // Fetches the Routes API
    // Returns the API PromiseObject
    return await fetch(SwouterSettings.routesApiUrl)
        .then(Response => {
            // Forward JSON
            return Response.json();
        })
        .then(Response => {
            // Send Routes to Array
            SwouterRoutes = Response;
            // Set LastChecked
            SwouterConfigLastChecked = CurrentTime;

            // Return Routes
            return SwouterRoutes;
        });

}



/**
 * Settings
 * - Allows you to change default Swouter Settings
 * - Technically, fetch could be used to change settings via API, so you could dynamically change the clients experience for e.g. when he signs in and has a different defaulRoute
 * - (Merges yours with default settings object)
 * @param {object} SettingsObject Object containing custom settings
 * @returns {object}
 */
export function Settings (SettingsObject: object): object
{

    // Merge the Objects
    SwouterSettings = {...SwouterSettings, ...SettingsObject};
    // Return the Options
    return SwouterSettings;

}



/**
 * [ASYNC] Navigate
 * - Navigates the client to given Route
 * - Loads Template
 * - Dispatches Event
 * @param {string} RouteID
 * @param {object} RouteParameter
 * @param {boolean} ForceGetRoutes
 * @param {[string=default]} Activation
 */
export async function Navigate (RouteID: string, RouteParameter: object = {}, ForceGetRoutes: boolean = false, Activation: string = 'default'): Promise<object>
{

    // Get Route Object
    const Route: any = await GetRoutes(ForceGetRoutes)
        .then(Response => {

            // Route exists
            if (Response && Response[RouteID]) return Response[RouteID];
            // The RouteID is not present
            else if (Response && !Response[RouteID] && (RouteID = SwouterSettings.errors.e404)) return Response[SwouterSettings.errors.e404];
            // GetRoutes returned something wrong
            else throw alert("Please contact the administrator!\nSwouter was unable to fetch the Routes API.");

        });

    // Build Path
    // Get From Route
    let Path: string = await MakePath(RouteID, RouteParameter);

    // Apply Id and Params
    SwouterCurrent.id = RouteID;
    SwouterCurrent.params = RouteParameter;

    // Set Title
    await SetTitle();

    // Push into History
    if (-1 >= ['Backwards', 'Forwards'].indexOf(Activation)) history.pushState({...{RouteID, RouteParameter}, ...Route}, document.title, [location.origin, Path].join(''));
    else if (-1 >= ['Initialization', 'Resolve'].indexOf(Activation)) history.replaceState({...{RouteID, RouteParameter}, ...Route}, document.title, [location.origin, Path].join(''));

    // Get Template
    await fetch([SwouterSettings.templateFolder, Route['templateUrl'], SwouterSettings.templateExtension].join(''))
        .then(Response => {
            // Forward Body
            return Response.text();
        })
        .then(Response => {

            let Output: string = Response;

            // Removes:
            // 1. Script Tags
            // 2. Line Breaks
            // 3. Whitespace between tags
            Output = Output.replace(/<\/?script>/gi, '');
            Output = Output.replace(/\n/gi, ' ');
            Output = Output.replace(/>\s+</gi, '><');

            // Forward Output
            return Output;

        })
        .then(Response => {

            // Get Navbar Button and set active
            const NavbarRelativeButton: HTMLElement = document.querySelector(`.mb-link[sgo="${RouteID.split('.')[0]}"]`);
            if (NavbarRelativeButton) SetActive(NavbarRelativeButton);

            // Set Page Content
            SwouterSettings.routerBox.innerHTML = Response;

        });

    // Dispatch Event 
    dispatchEvent(RouterBoxFilled);

    // Returns the Object of the Current Route
    return SwouterCurrent;

}



/**
 * Handle
 * - Executes Functions on RouteMatch
 * @param {string} RouteID 
 * @param {Array<Function>} Callbacks 
 */
export function Handle (RouteID: string, Callbacks: Array<any>): void
{

    // On Any Route
    if ('*' === RouteID) window.addEventListener('RouterBoxFilled', () => Callbacks.forEach(Callback => Callback()));

    // On RouteID Route
    else window.addEventListener('RouterBoxFilled', () => {
        if (RouteID === SwouterCurrent.id) Callbacks.forEach(Callback => Callback());
    });

}



/**
 * HandleM
 * - Multie-Use-Function for Handle
 * @param {Array<Array<any>>} Handles
 * @returns {void}
 */
export function HandleM (Handles: Array<Array<any>>): void
{

    // Use Handler on each
    Handles.forEach(Handler => Handle(Handler[0], Handler[1]));

}



/**
 * GetCurrent
 * - Get the Current Route Object and returns it
 * @returns {object}
 */
export function GetCurrent (): object
{
    
    // Returns the SwouterCurrent Object
    return SwouterCurrent;

}



/**
 * [ASYNC] MakePath
 * - Generates a Path, based on the schema associated to the RouteID in the config
 * @param {string} RouteID 
 * @param {[object={}]} RouteParameter
 * @returns {Promise<string>}
 */
export async function MakePath (RouteID: string, RouteParameter: object = {}): Promise<string>
{
    
    // Get Route Object
    const Route: any = await GetRoutes()
        .then(Response => {

            // Route exists
            if (Response && Response[RouteID]) return Response[RouteID];
            // The RouteID is not present
            else if (Response && !Response[RouteID] && (RouteID = SwouterSettings.errors.e404)) return Response[SwouterSettings.errors.e404];
            // GetRoutes returned something wrong
            else throw alert("Please contact the administrator!\nSwouter was unable to fetch the Routes API.");

        });

    // Build Path
    // Get From Route
    let Path: string = Route['schema'];
    // Get Placeholder Check RegExp
    let CheckUrlPlaceholder: RegExp = new RegExp(Expressions.CheckUrlPlaceholder);
    // Check for Placeholders
    // If Present, replace
    if (CheckUrlPlaceholder.test(Path)) Object.keys(RouteParameter).forEach(Param => {
        // Replace Placeholders
        Path = Path.replace([':', Param].join(''), RouteParameter[Param]);
    });

    // Return the Path
    return Path;

}