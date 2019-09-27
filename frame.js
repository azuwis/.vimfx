vimfx.listen('getInfo', (data, callback) => {
    let {document} = content
    let title = document.title
    let url = document.URL
    let selection = content.getSelection().toString()
    let {href} = document.activeElement
    if (!href) {
        let a = document.querySelector('a:hover')
        if (a)
            href = a.href
    }
    callback({title, url, selection, href})
})
