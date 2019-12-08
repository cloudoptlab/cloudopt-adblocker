import { getHost } from '../core/utils'
import { refresh as refreshConfig } from '../core/config'
import * as message from '../core/message'
import $ from 'jquery'
import {sanitize} from 'dompurify'

class BookmarkSearch {
    private readonly host: string
    private readonly innerClass: string
    private keyword: string
    constructor() {
        this.host = getHost(window.location.href)
        if (this.host === 'www.baidu.com') {
            this.keyword = $('#kw').val() as string
            this.innerClass = '#content_left'
            $('#kw').bind('input propertychange', () => {
                this.keyword = $('#kw').val() as string
                this.sendSearch(this.keyword)
            })
            this.sendSearch(this.keyword)
        } else if (this.host.startsWith('www.google.')) {
            this.keyword = $('#lst-ib').val() as string
            this.innerClass = '#res'
            $('#lst-ib').bind('input propertychange', () => {
                this.keyword = $('#lst-ib').val() as string
                this.sendSearch(this.keyword)
            })
            this.sendSearch(this.keyword)
        } else if (this.host.endsWith('.bind.com')) {
            this.keyword = $('#sb_form_q').val() as string
            this.innerClass = '#b_results'
            $('#sb_form_q').bind('input propertychange', () => {
                this.keyword = $('#sb_form_q').val() as string
                this.sendSearch(this.keyword)
            })
            this.sendSearch(this.keyword)
        } else if (this.host.endsWith('search.naver.com')) {
            this.keyword = $('#nx_query').val() as string
            this.innerClass = '#sub_pack'
            $('#nx_query').bind('input propertychange', () => {
                this.keyword = $('#nx_query').val() as string
                this.sendSearch(this.keyword)
            })
            this.sendSearch(this.keyword)
        }
    }

    public sendSearch(keyword: string) {
        message.send('bookmark-search', keyword).then((response) => {
            $('#cloudopt-bookmark').remove()
            if (response.length > 0) {
                this.createCard(response as any[])
            }
        })
    }

    private createCard(response: any[]) {
        const card = '<div id="cloudopt-bookmark"><div class="cloudopt-bookmark-head">BookMark Search<a id="cloudopt-bookmark-close" href="#"><img class="cloudopt-icon" src="https://cdn.cloudopt.net/extensions/resource/close.png" /></a><a href="https://www.cloudopt.net" target="_blank"><img src="https://cdn.cloudopt.net/extensions/resource/logo.png"></a></div></div>'
        if (response.length > 0) {
            $(card).appendTo(this.innerClass)
            response.forEach((item) => {
                if (item.url && item.url.indexOf('place:') < 0) {
                    const a = [item.url, item.title, item.url].map<string>(sanitize)
                    const html = `<div class="cloudopt-bookmark-li"><a href="${a[0]}" target="_blank">${a[1]}</a><p>${a[2]}</p></div>`
                    $(html).appendTo('#cloudopt-bookmark')
                }
            })
        }
    }
}

async function bookmarksearchOnReady() {
    const config = await refreshConfig()
    if (!config.labBookmarkSearch) {
        return
    }
}

let bookmarkSearch: BookmarkSearch
$.when($.ready).then(async () => {
    const config = await refreshConfig()
    if (!config.labBookmarkSearch) {
        return
    }
    bookmarkSearch = new BookmarkSearch()
})
