vimfx.listen('getSelection', (data, callback) => {
    let selection = content.getSelection().toString()
    callback(selection)
})
