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

if (content.document.URL.startsWith('moz-extension://') && content.document.URL.endsWith('#3p-filters.html')) {
    vimfx.listen('ublockBootstrap', (data, callback) => {
        let filters = {
            'easyprivacy': true,
            'easylist': true,
            'CHN-0': true,
            'CHN-1': true,
        }
        let customFilters = [
            'https://github.com/azuwis/org/raw/master/adblock-filters.txt'
        ]
        let {document} = content
        document = document.querySelector('iframe').contentWindow.document
        let lists = document.querySelectorAll('#lists li.listEntry:not(.unused)')
        for (let item of lists) {
            let key = item.getAttribute('data-listkey')
            let value = filters[key]
            if (value) {
                let checkbox = item.querySelector('input[type="checkbox"]')
                checkbox.checked = value
            }
        }
        let importCheckbox = document.querySelector('#importLists')
        if (!importCheckbox.checked) {
            importCheckbox.click()
        }
        let externalLists = document.querySelector('#externalLists')
        let customFiltersString = customFilters.join("\n")
        if (externalLists.value !== customFiltersString) {
            externalLists.value = customFiltersString
        }
        let button = document.querySelector('#buttonApply')
        button.disabled = false
        button.click()
        button = document.querySelector('#buttonUpdate')
        // button.classList.remove('disabled')
        button.click()
    })
}
