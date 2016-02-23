// example: https://github.com/lydell/dotfiles/blob/master/.vimfx/config.js

let map = (shortcuts, command, custom=false) => {
    vimfx.set(`${custom ? 'custom.' : ''}mode.normal.${command}`, shortcuts)
}

map('', 'window_new')
map('w', 'tab_select_previous')
map('e', 'tab_select_next')

let set = (pref, valueOrFunction) => {
    let value = typeof valueOrFunction === 'function'
        ? valueOrFunction(vimfx.getDefault(pref))
        : valueOrFunction
    vimfx.set(pref, value)
}

set('prevent_autofocus', true)
set('hints_sleep', -1)
set('prev_patterns', v => `[上前]\\s*一?\\s*[页张个篇章頁] newer\\s*posts? ${v}`)
set('next_patterns', v => `[下后]\\s*一?\\s*[页张个篇章頁] older\\s*posts? ${v}`)
