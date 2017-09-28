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

const puppetTemplate = document.querySelector('#puppetTemplate')
const puppets = document.querySelector('#puppets')

const labelTextbox      = document.querySelector('#label')
const webhookTextbox    = document.querySelector('#webhook')
const addButton         = document.querySelector('#add')

const introduction      = document.querySelector('#introduction')

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


