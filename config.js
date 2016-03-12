// example: https://github.com/lydell/dotfiles/blob/master/.vimfx/config.js

// helper functions
let {commands} = vimfx.modes.normal

let set = (pref, valueOrFunction) => {
    let value = typeof valueOrFunction === 'function'
        ? valueOrFunction(vimfx.getDefault(pref))
        : valueOrFunction
    vimfx.set(pref, value)
}

let map = (shortcuts, command, custom=false) => {
    vimfx.set(`${custom ? 'custom.' : ''}mode.normal.${command}`, shortcuts)
}

// options
set('prevent_autofocus', true)
set('hints_sleep', -1)
set('prev_patterns', v => `[上前]\\s*一?\\s*[页张个篇章頁] ${v}`)
set('next_patterns', v => `[下后]\\s*一?\\s*[页张个篇章頁] ${v}`)

// shortcuts
map('', 'window_new')
map('w', 'tab_select_previous')
map('e', 'tab_select_next')

// commands
vimfx.addCommand({
    name: 'search_selected_text',
    description: 'Search for the selected text'
}, ({vim}) => {
    vimfx.send(vim, 'getSelection', {}, selection => {
        let inTab = true // Change to `false` if you’d like to search in current tab.
        vim.window.BrowserSearch.loadSearch(selection, inTab)
    })
})
map(',s', 'search_selected_text', true)

vimfx.addCommand({
    name: 'goto_addons',
    description: 'Addons',
}, ({vim}) => {
    vim.window.BrowserOpenAddonsMgr()
})
map(',a', 'goto_addons', true)

vimfx.addCommand({
    name: 'goto_config',
    description: 'Config',
}, ({vim}) => {
    vim.window.switchToTabHavingURI('about:config', true)
})
map(',c', 'goto_config', true)

vimfx.addCommand({
    name: 'goto_downloads',
    description: 'Downloads',
}, ({vim}) => {
    // vim.window.document.getElementById('downloads-button').click()
    vim.window.switchToTabHavingURI('about:downloads', true)
})
map(',d', 'goto_downloads', true)

vimfx.addCommand({
    name: 'mpv',
    description: 'Mpv',
}, ({vim}) => {
    let file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile)
    file.initWithPath("/usr/bin/mpv")
    let process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess)
    process.init(file)
    let url = vim.window.gBrowser.selectedBrowser.currentURI.spec
    let args = ['--profile=pseudo-gui', '--cache=no', '--fs', url]
    process.runAsync(args, args.length)
})
map(',m', 'mpv', true)

vimfx.addCommand({
    name: 'search_tabs',
    description: 'Search tabs',
    category: 'location',
    order: commands.focus_location_bar.order + 1,
}, (args) => {
    commands.focus_location_bar.run(args)
    args.vim.window.gURLBar.value = '% '
})
map(',t', 'search_tabs', true)

vimfx.addCommand({
    name: 'restart',
    description: 'Restart',
}, ({vim}) => {
    Services.startup.quit(Services.startup.eRestart | Services.startup.eAttemptQuit)
})
map(',R', 'restart', true)

let bootstrap = () => {
    Components.utils.import("resource://gre/modules/XPCOMUtils.jsm")
    XPCOMUtils.defineLazyModuleGetter(this, "Preferences", "resource://gre/modules/Preferences.jsm")
    XPCOMUtils.defineLazyModuleGetter(this, "AddonManager", "resource://gre/modules/AddonManager.jsm")
    XPCOMUtils.defineLazyModuleGetter(this, "NetUtil", "resource://gre/modules/NetUtil.jsm")
    XPCOMUtils.defineLazyModuleGetter(this, "PlacesUtils", "resource://gre/modules/PlacesUtils.jsm")
    // set font for different OSes
    let os = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS
    switch (os) {
    case 'Darwin':
        Preferences.set('font.name.monospace.x-western', 'Menlo')
        break
    case 'WINNT':
        Preferences.set('font.name.monospace.zh-CN', 'Consolas')
        Preferences.set('font.name.sans-serif.zh-CN', '微软雅黑')
        Preferences.set('font.name.serif.zh-CN', '微软雅黑')
        break
    }
    // install addons
    let addons = [
        {id: 'https-everywhere@eff.org', url: 'https-everywhere'},
        {id: 'uBlock0@raymondhill.net', url: 'ublock-origin'},
        {id: 'VimFx@akhodakivskiy.github.com', url: 'vimfx'},
        {id: 'ClassicThemeRestorer@ArisT2Noia4dev', url: 'classicthemerestorer'},
        {id: 'thefoxonlybetter@quicksaver', url: 'the-fox-only-better'}
    ]
    addons.forEach((element, index, array) => {
        AddonManager.getAddonByID(element.id, (addon) => {
            if(!addon) {
                let url = element.url
                if(!url.startsWith('https://')) {
                    url = 'https://addons.mozilla.org/firefox/downloads/latest/' + url
                }
                AddonManager.getInstallForURL(url, (aInstall) => {
                    aInstall.install()
                }, "application/x-xpinstall")
            }
        })
    })
    // disable addons
    // AddonManager.getAllAddons((addons) => {
    //     console.log("List addons:")
    //     addons.forEach((element) => {
    //         console.log(JSON.stringify({name: element.name, id: element.id, disabled: element.userDisabled}))
    //     })
    // })
    let disabled_addons = [
        'firefox@getpocket.com',
        'gmp-gmpopenh264',
        'loop@mozilla.org',
    ]
    disabled_addons.forEach((element) => {
        AddonManager.getAddonByID(element, (addon) => {
            addon.userDisabled = true
        })
    })
    // hide default search engines except google
    Services.search.getEngines().forEach((e) => {if(e.name!="Google") e.hidden = true})
    // add custom search engine keywords
    let search_engines = [
        {keyword: 'g', title:'Google Search', url: 'https://www.google.com/search?q=%s&ion=0&safe=off&lr=lang_zh-CN|lang_zh-TW|lang_en'},
        {keyword: 'gl', title:'Google Lucky', url: 'https://www.google.com/search?q=%s&ion=0&lr=lang_zh-CN|lang_zh-TW|lang_en&btnI=1'},
        {keyword: 'ddg', title:'Duckduckgo Search', url: 'https://duckduckgo.com/?q=%s&kf=fw&kj=b2&ks=t&kw=n&ka=g&ko=s&kt=Lucida%20Grande&km=m&k1=-1&kv=1'},
        {keyword: 'w', title: 'Wikipedia Search', url: 'https://en.wikipedia.org/wiki/Special:Search?search=%s'},
        {keyword: 't', title: 'Twitter Search', url: 'https://twitter.com/search/%s'},
        {keyword: 'd', title: 'Debian Package Search', url: 'https://packages.debian.org/search?keywords=%s'},
        {keyword: 'df', title: 'Debian File Search', url: 'https://packages.debian.org/search?searchon=contents&mode=filename&keywords=%s'},
        {keyword: 'dfl', title: 'Debian File List', url: 'https://packages.debian.org/sid/all/%s/filelist'},
        {keyword: 'db', title: 'Debian Bug Search', url: 'https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=%s'},
    ]
    let bookmarks = PlacesUtils.bookmarks
    search_engines.forEach((element, index, array) => {
        let uri = NetUtil.newURI(element.url, null, null)
        if (!bookmarks.isBookmarked(uri)) {
            bookmarks.insertBookmark(
                bookmarks.unfiledBookmarksFolder,
                uri,
                bookmarks.DEFAULT_INDEX,
                element.title)
        }
        PlacesUtils.keywords.insert(element)
    })
}
vimfx.addCommand({
    name: 'bootstrap',
    description: 'Bootstrap',
}, ({vim}) => {
    try {
        bootstrap()
    } catch (error) {
        vim.notify("Bootstrap failed")
        console.error(error)
        return
    }
    vim.notify("Bootstrap succeeded")
})
map('zb', 'bootstrap', true)
