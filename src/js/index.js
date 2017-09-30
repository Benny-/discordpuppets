/*
BSD 3-Clause License

Copyright (c) 2017, Benny Jacobs
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the copyright holder nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

'use strict';

import Qs from 'qs'
import fetch from 'whatwg-fetch'

const puppetTemplate = document.querySelector('#puppetTemplate')
const body = document.querySelector('body')

const labelTextbox      = document.querySelector('#label')
const webhookTextbox    = document.querySelector('#webhook')
const addButton         = document.querySelector('#add')

const introduction      = document.querySelector('#introduction')

const url = new URL(window.location)

const checkStatus = function(response) {
    if (response.status >= 200 && response.status < 300) {
        return response
    } else {
        var error = new Error(response.statusText)
        error.response = response
        throw error
    }
}

const parseJSON = function(response) {
  return response.json()
}

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

const templateContent = function(template) {
    if("content" in document.createElement("template")) {
        return document.importNode(template.content, true);
    } else {
        var fragment = document.createDocumentFragment();
        var children = template.childNodes;
        for (i = 0; i < children.length; i++) {
            fragment.appendChild(children[i].cloneNode(true));
        }
        return fragment;
    }
}

actors.forEach(function(actor, i, arr) {
    const clone = templateContent(puppetTemplate)
    
    const img = clone.querySelector('img')
    const label = clone.querySelector('.label')
    const name = clone.querySelector('small.name')
    const textarea = clone.querySelector('textarea')
    const sayButton = clone.querySelector('button.say')
    const removeButton = clone.querySelector('button.remove')
    const errorsSection = clone.querySelector('p.errors')
    
    label.textContent = actor.label
    
    sayButton.disabled = true
    
    window.fetch(actor.webhook, {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
        redirect: 'follow',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(checkStatus)
    .then(parseJSON)
    .then(function(webhook) {
        name.textContent = webhook.name
        img.src = 'https://cdn.discordapp.com/avatars/'+webhook.id+'/'+webhook.avatar+'.png?size=128'
        
        sayButton.disabled = false
        sayButton.addEventListener('click', function() {
            sayButton.disabled = true
            
            window.fetch(actor.webhook, {
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
            })
            .then(checkStatus)
            .then(function(response) {
                sayButton.disabled = false
            }).catch(function(err) {
                console.log(err)
                errorsSection.textContent = "WebHook request was not properly handeled. The WebHook might have been removed from admin panel. Try Refreshing page."
            })
        })
    }).catch(function(err) {
        console.log(err)
        img.src = 'images/errorcord.png'
        errorsSection.textContent = "WebHook was not responding properly. It might have been removed from admin panel."
        textarea.disabled = true
    })
    
    removeButton.addEventListener('click', function() {
        actors.splice(actors.findIndex(function(elm) {
            return elm === actor
        }), 1)
        console.log(actors)
        window.location = url.origin + url.pathname + '?' + Qs.stringify({'actors':actors})
    })
    
    body.appendChild(clone)
})

addButton.addEventListener('click', function() {
    addButton.disabled = true
    window.fetch(webhookTextbox.value, {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
        redirect: 'follow',
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(function(response) {
        if(response.status >= 200 && response.status < 300)
        {
            actors.push({
                'label': labelTextbox.value,
                'webhook': webhookTextbox.value,
            })
            window.location = url.origin + url.pathname + '?' + Qs.stringify({'actors':actors})
        }
        else
        {
            return Promise.reject("Invalid WebHook: Server returned a error code")
        }
        
    }).catch(function(err) {
        alert(err)
        addButton.disabled = false
    })
})


