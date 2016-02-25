// example: https://github.com/lydell/dotfiles/blob/master/.vimfx/config.js

vimfx.addCommand({
    name: 'goto_addons',
    description: 'Addons',
}, ({vim}) => {
    vim.window.BrowserOpenAddonsMgr()
})

vimfx.addCommand({
    name: 'goto_downloads',
    description: 'Downloads',
}, ({vim}) => {
    vim.window.gBrowser.selectedTab = vim.window.gBrowser.addTab('about:downloads')
})

let bootstrap = () => {
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

let map = (shortcuts, command, custom=false) => {
    vimfx.set(`${custom ? 'custom.' : ''}mode.normal.${command}`, shortcuts)
}

map('', 'window_new')
map('w', 'tab_select_previous')
map('e', 'tab_select_next')

map(',a', 'goto_addons', true)
map(',d', 'goto_downloads', true)
map('zb', 'bootstrap', true)

let set = (pref, valueOrFunction) => {
    let value = typeof valueOrFunction === 'function'
        ? valueOrFunction(vimfx.getDefault(pref))
        : valueOrFunction
    vimfx.set(pref, value)
}

set('prevent_autofocus', true)
set('hints_sleep', -1)
set('prev_patterns', v => `[上前]\\s*一?\\s*[页张个篇章頁] ${v}`)
set('next_patterns', v => `[下后]\\s*一?\\s*[页张个篇章頁] ${v}`)
