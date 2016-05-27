vimfx.listen('getSelection', (data, callback) => {
    let selection = content.getSelection().toString()
    callback(selection)
})

vimfx.listen('getFocusedHref', (data, callback) => {
    let {document} = content
    let {href} = document.activeElement
    if (!href) {
        let a = document.querySelector('a:hover')
        if (a)
            href = a.href
    }
    callback(href)
})

vimfx.listen('orgCapture', (data, callback) => {
    let title = content.document.title
    let selection = content.getSelection().toString()
    callback({title, selection})
})
