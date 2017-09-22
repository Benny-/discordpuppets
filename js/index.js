'use strict';

const puppetTemplate = document.querySelector('#puppetTemplate');
const puppets = document.querySelector('#puppets');

const labelTextbox     = document.querySelector('#label');
const webhookTextbox   = document.querySelector('#webhook');
const addButton        = document.querySelector('#add');

const url = new URL(window.location)

let qs = url.search

if(qs.charAt(0) === '?')
{
    qs = qs.substr(1)
}

const actors = Qs.parse(qs).actors || [
/*
    {
        label: 'Antagonist',
        webhook: 'https://discordapp.com/api/webhooks/ect',
    },
*/
]

console.log(actors)

function supportsTemplate() {
  return 'content' in document.createElement('template')
}

if(supportsTemplate())
{
    actors.forEach(function(elm, i, arr) {
        puppetTemplate.content.querySelector('h3').textContent = elm.label
        
        const clone = document.importNode(puppetTemplate.content, true)
        const textarea = clone.querySelector('textarea')
        const button = clone.querySelector('button')
        
        button.addEventListener('click', function() {
            button.disabled = true
            
            window.fetch(elm.webhook, {
                method: 'POST',
                mode: 'cors',
                cache: 'default',
                redirect: 'follow',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: textarea.value,
                })
            }).then(function(response) {
                button.disabled = false
            }, function(err) {
                button.disabled = false
            })
            
        })
        puppets.appendChild(clone);
    })
}
else
{
    console.log("Templates unsupported. I'm not sure what to do >_<")
}

addButton.addEventListener('click', function() {
    addButton.disabled = true
    
    actors.push({
        'label': labelTextbox.value,
        'webhook': webhookTextbox.value,
    })
    
    
    window.location = url.origin + url.pathname + '?' + Qs.stringify({'actors':actors})
})


