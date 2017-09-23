'use strict';

const puppetTemplate = document.querySelector('#puppetTemplate');
const puppets = document.querySelector('#puppets');

const labelTextbox      = document.querySelector('#label');
const webhookTextbox    = document.querySelector('#webhook');
const addButton         = document.querySelector('#add');

const introduction      = document.querySelector('#introduction');

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
        webhook: 'https://discordapp.com/api/webhooks/blahblahblah_ect',
    },
*/
]

if(actors.length)
{
    introduction.style.display = "none"
}

function supportsTemplate() {
  return 'content' in document.createElement('template')
}

if(supportsTemplate())
{
    actors.forEach(function(elm, i, arr) {
        const clone = document.importNode(puppetTemplate.content, true)
        
        const label = clone.querySelector('.label')
        const name = clone.querySelector('small.name')
        const textarea = clone.querySelector('textarea')
        const button = clone.querySelector('button')
        const img = clone.querySelector('img')
        
        label.textContent = elm.label
        
        button.disabled = true
        
        window.fetch(elm.webhook, {
            method: 'GET',
            mode: 'cors',
            cache: 'default',
            redirect: 'follow',
            headers: {
                'Content-Type': 'application/json'
            },
        }).then(function(response) {
            return response.json()
        }, function(err) {
            console.log(err)
            textarea.textContent = "WebHook was not responding properly"
            textarea.disabled = true
        }).then(function(webhook) {
            name.textContent = webhook.name
            img.src = 'https://cdn.discordapp.com/avatars/'+webhook.id+'/'+webhook.avatar+'.png?size=128'
            
            button.disabled = false
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
        })
        
        puppets.appendChild(clone);
    })
}
else
{
    console.log("Templates unsupported. I'm not sure what to do >_<")
}

addButton.addEventListener('click', function() {
    actors.push({
        'label': labelTextbox.value,
        'webhook': webhookTextbox.value,
    })
    window.location = url.origin + url.pathname + '?' + Qs.stringify({'actors':actors})
})


