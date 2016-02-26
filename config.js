// example: https://github.com/lydell/dotfiles/blob/master/.vimfx/config.js

// helper functions
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
    let {messageManager} = vim.window.gBrowser.selectedBrowser
    let callback = ({data: {selection}}) => {
        messageManager.removeMessageListener('VimFx-config:selection', callback)
        let inTab = true // Change to `false` if you’d like to search in current tab.
        vim.window.BrowserSearch.loadSearch(selection, inTab)
    }
    messageManager.addMessageListener('VimFx-config:selection', callback)
    messageManager.sendAsyncMessage('VimFx-config:getSelection')
})
map('S', 'stop')
map('s', 'search_selected_text', true)

vimfx.addCommand({
    name: 'goto_addons',
    description: 'Addons',
}, ({vim}) => {
    vim.window.BrowserOpenAddonsMgr()
})
map(',a', 'goto_addons', true)

vimfx.addCommand({
    name: 'goto_downloads',
    description: 'Downloads',
}, ({vim}) => {
    vim.window.gBrowser.selectedTab = vim.window.gBrowser.addTab('about:downloads')
})
map(',d', 'goto_downloads', true)

let bootstrap = () => {
    // hide default search engines except google
    Services.search.getEngines().forEach((e) => {if(e.name!="Google") e.hidden = true})
    // set font for different OSes
    let os = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS
    let prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch)
    switch (os) {
    case 'Darwin':
        prefs.setCharPref('font.name.monospace.x-western', 'Menlo')
        break
    case 'WINNT':
        prefs.setCharPref('font.name.monospace.zh-CN', 'Consolas')
        prefs.setCharPref('font.name.sans-serif.zh-CN', '微软雅黑')
        prefs.setCharPref('font.name.serif.zh-CN', '微软雅黑')
        break
    }
    // add custom search engine keywords
    Components.utils.import("resource://gre/modules/XPCOMUtils.jsm")
    XPCOMUtils.defineLazyModuleGetter(this, "PlacesUtils", "resource://gre/modules/PlacesUtils.jsm")
    let search_engines = [
        {keyword: 'g', url: 'https://www.google.com/search?q=%s&ion=0&safe=off&lr=lang_zh-CN|lang_zh-TW|lang_en'},
        {keyword: 'gl', url: 'https://www.google.com/search?q=%s&ion=0&lr=lang_zh-CN|lang_zh-TW|lang_en&btnI=1'},
        {keyword: 'ddg', url: 'https://duckduckgo.com/?q=%s&kf=fw&kj=b2&ks=t&kw=n&ka=g&ko=s&kt=Lucida%20Grande&km=m&k1=-1&kv=1'},
        {keyword: 'w', url: 'https://en.wikipedia.org/wiki/Special:Search?search=%s'},
        {keyword: 't', url: 'https://twitter.com/search/%s'},
        {keyword: 'd', url: 'https://packages.debian.org/search?keywords=%s'},
        {keyword: 'df', url: 'https://packages.debian.org/search?searchon=contents&mode=filename&keywords=%s'},
        {keyword: 'dfl', url: 'https://packages.debian.org/sid/all/%s/filelist'},
        {keyword: 'db', url: 'https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=%s'},
    ]
    search_engines.forEach((element, index, array) => {
        PlacesUtils.keywords.insert(element)
    })
}
vimfx.addCommand({
    name: 'bootstrap',
    description: 'Bootstrap',
}, ({vim}) => {
    vim.notify("Bootstrapping...")
    bootstrap()
})
map('zb', 'bootstrap', true)
