var urlHelper = require('url');

function LinkPager(itemsPerPage, linksCount, renderConfig) {
    this.options = {
        itemsPerPage: parseInt(itemsPerPage, 10) || 10,
        linksCount: parseInt(linksCount, 10) || 10
    };
    renderConfig = renderConfig || {};
    this.renderConfig = {
        listClass: renderConfig.listClass || 'pagination',
        itemClass: renderConfig.itemClass || 'page',
        firstClass: renderConfig.firstClass || 'first',
        prevClass: renderConfig.prevClass || 'previous',
        nexClass: renderConfig.nexClass || 'next',
        lastClass: renderConfig.lastClass || 'last',

        showFirst: true,
        showLast: true,
        showPrev: true,
        showNext: true
    };
}

LinkPager.prototype.build = function (config) {
    var options = this.options;
    var currentPage = config.currentPage || 1;
    var itemsCount = config.itemsCount || 1;
    var firstPage = 1;
    var lastPage = Math.ceil(itemsCount / options.itemsPerPage);
    var linksCount = Math.min(options.linksCount, lastPage);
    var prevPage = (currentPage - 1) || currentPage;
    var nextPage = Math.min(lastPage, currentPage + 1);

    this.config = {
        currentPage: currentPage,
        itemsCount: itemsCount,
        firstPage: firstPage,
        lastPage: lastPage,
        linksCount: linksCount,
        prevPage: prevPage,
        nextPage: nextPage
    };

    var url = config.url || '';             //  http://site.com/items/?foo=bar&a=4
    var urlPrefix = config.urlPrefix || '';       //  http://site.com/items/
    var urlPostfix = config.urlPostfix || '';      //  /print
    var urlFirst = config.urlFirst || urlPrefix; //  http://site.com/items/
    var urlFormat = config.urlFormat || '';       //  http://site.com/items/#page#/print

    this.urlConfig = {
        url: url,
        urlPrefix: urlPrefix,
        urlPostfix: urlPostfix,
        urlFirst: urlFirst,
        urlFormat: urlFormat
    };

    return this;
};

LinkPager.prototype.render = function (config) {
    if (config) this.build(config);
    var c = this.config;
    var u = this.urlConfig;
    var o = this.options;
    var r = this.renderConfig;
    var createUrl = getCreateUrlFunction(u);

    var html = [];
    html.push('<ul class="' + r.listClass + '">');

    var cls = '';
    if (c.currentPage == c.firstPage) {
        cls = ' disabled';
    }
    if (r.showFirst)
        html.push('<li class="' + r.firstClass + cls + '"><a href="' + createUrl(1) + '">начало</a></li>');
    if (r.showPrev)
        html.push('<li class="' + r.prevClass + cls + '"><a href="' + createUrl(c.prevPage) + '"><i class="material-icons">chevron_left</i></a></li>');

    var firstStep = Math.max(1, c.currentPage - parseInt(o.linksCount / 2, 10)),
        lastStep;
    if ((lastStep = firstStep + o.linksCount - 1) >= c.lastPage) {
        lastStep = c.lastPage;
        firstStep = Math.max(1, lastStep - o.linksCount + 1);
    }
    if (lastStep != firstStep) {
        for (var i = firstStep; i <= lastStep; i++) {
            var selected = (i == c.currentPage) ? ' active' : 'waves-effect';
            html.push('<li class="' + r.itemClass + selected + '"><a href="' + createUrl(i) + '">' + i + '</a></li>');
        }
    }

    cls = '';
    if (c.currentPage == c.lastPage) {
        cls = ' disabled';
    }
    if (r.showNext)
        html.push('<li class="' + r.nexClass + cls + '"><a href="' + createUrl(c.nextPage) + '"><i class="material-icons">chevron_right</i></a></li>');
    if (r.showLast)
        html.push('<li class="' + r.lastClass + cls + '"><a href="' + createUrl(c.lastPage) + '">в конец</a></li>');

    html.push('</ul>');
    return html.join(' ');
};

exports.create = function (itemsPerPage, linksCount, renderConfig) {
    return new LinkPager(itemsPerPage, linksCount, renderConfig);
};

function getCreateUrlFunction(urlConfig) {
    var func;
    //
    // url
    //
    if (urlConfig.url) {
        var parsedUrl = urlHelper.parse(urlConfig.url, true);
        if (!parsedUrl) parsedUrl = {};
        if (!parsedUrl.query) parsedUrl.query = {};
        if (parsedUrl.search !== undefined) delete parsedUrl.search;
        func = function (page) {
            var url;
            if (page == 1) {
                url = urlConfig.url;
            } else {
                parsedUrl.query.page = page;
                url = urlHelper.format(parsedUrl);
            }
            return url;
        };
    }
    //
    // urlFormat
    //
    else if (urlConfig.urlFormat) {
        func = function (page) {
            var url;
            if (page == 1 && urlConfig.urlFirst) {
                url = urlConfig.urlFirst;
            } else {
                url = urlConfig.urlFormat.replace('#page#', page);
            }
            return url;
        };
    }
    //
    //  urlConfig.urlPrefix / urlConfig.urlPostfix
    //
    else if (urlConfig.urlPrefix || urlConfig.urlPostfix) {
        func = function (page) {
            var url;
            if (page == 1) {
                url = urlConfig.urlFirst;
            } else {
                url = urlConfig.urlPrefix + page + urlConfig.urlPostfix;
            }
            return url;
        };
    } else {
        func = function (page) {
            return '?' + page;
        }
    }
    return func;
}