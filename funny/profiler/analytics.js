var PERFORMANCE_TIMING_KEYS = [
                    'fetchstart',
                    'domainlookupstart',
                    'domainlookupend',
                    'connectstart',
                    'connectend',
                    'requeststart',
                    'responsestart',
                    'responseend'
                ];
var NSCOUNT = 0;
var FSCOUNT = 0;
var re500 = 0,
    re1000 = 0,
    re1500 = 0,
    re2000 = 0,
    re3000 = 0,
    re5000 = 0,
    reGT5000 = 0,
    reLonggggggg = 0;

if ( typeof window === 'undefined') {
    var fs = require('fs');


    fs.readFile('blog.json', function(err, blogData) {
        caculate( blogData );
    });
} else {
    caculate( blogData );
}

function caculate(data) {
    data = JSON.parse(data)
    data.forEach(function(perf, index) {
        var ns = perf.navigationstart,
            fs = perf.fetchstart,
            re = perf.responseend - ns,
            nsCount = 0,
            fsCount = 0;

        PERFORMANCE_TIMING_KEYS.forEach(function(key) {
            if (perf[key] === ns || perf[key] === fs) {
                if (perf[key] === ns) {
                    nsCount ++;
                }

                if (perf[key] === fs) {
                    fsCount ++;
                }
            }
        })

        if (re < 500) {
            re500 ++
        } else if (re < 1000) {
            re1000 ++
        } else if (re < 1500) {
            re1500 ++
        } else if (re < 2000) {
            re2000 ++
        } else if (re < 3000) {
            re3000 ++
        } else if (re < 5000) {
            re5000 ++
        } else {
            reGT5000 ++
        }

        if (re > reLonggggggg)
            reLonggggggg = re

        if (nsCount === 7)
            NSCOUNT ++

        if (fsCount === 7)
            FSCOUNT ++
    })

    console.log('---------------------------------------------\n');
    console.log('               navigationStart的垃圾数据有' + NSCOUNT + '\n');
    console.log('               fetchStart的垃圾数据有' + FSCOUNT + '\n');
    console.log('')
    console.log('               接受文档时间：\n')
    console.log('                   0     ~    500ms      ' + re500)
    console.log('                   500ms ~    1s         ' + re1000)
    console.log('                   1s    ~    1.5s       ' + re1500)
    console.log('                   1.5s  ~    2s         ' + re500)
    console.log('                   2s    ~    3s         ' + re500)
    console.log('                   3s    ~    5s         ' + re500)
    console.log('                   5s    ~               ' + re500)
    console.log('')
    console.log('               最久接受文档时间：  ' + reLonggggggg + 'ms\n')
    console.log('---------------------------------------------');
};