vimfx.listen('getSelection', (data, callback) => {
    let selection = content.getSelection().toString()
    callback(selection)
})

vimfx.listen('getCurrentHref', (data, callback) => {
    let document = content.document
    let {href} = document.activeElement
    if (!href) {
        let a = document.querySelector('a:hover')
        if(a)
            href = a.href
    }
    callback(href)
})
