addMessageListener('VimFx-config:getSelection', ({data: {exampleValue}}) => {
    let selection = content.getSelection().toString()
    sendAsyncMessage('VimFx-config:selection', {selection})
})
