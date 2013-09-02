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
var reLonggggggg = 0;

var d500 =  {};
var d1000 = {};
var d1500 = {};
var d2000 = {};
var d3000 = {};
var d5000 = {};
var dGT5000 = {};

var generateRule = function(obj) {
    obj.re = 0;
    obj.tre = 0;
    obj.tdo = 0;
}

generateRule( d500 );
generateRule( d1000 );
generateRule( d1500 );
generateRule( d2000 );
generateRule( d3000 );
generateRule( d5000 );
generateRule( dGT5000 );

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
            dom = perf.domcomplete -  perf.domloading,
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
            d500.re ++
            d500.tre += re;
            d500.tdo += dom;
        } else if (re < 1000) {
            d1000.re ++
            d1000.tre += re;
            d1000.tdo += dom;
        } else if (re < 1500) {
            d1500.re ++
            d1500.tre += re;
            d1500.tdo += dom;
        } else if (re < 2000) {
            d2000.re ++
            d2000.tre += re;
            d2000.tdo += dom;
        } else if (re < 3000) {
            d3000.re ++
            d3000.tre += re;
            d3000.tdo += dom;
        } else if (re < 5000) {
            d5000.re ++
            d5000.tre += re;
            d5000.tdo += dom;
        } else {
            dGT5000.re ++
            dGT5000.tre += re;
            dGT5000.tdo += dom;
        }

        if (re > reLonggggggg)
            reLonggggggg = re

        if (nsCount === 7)
            NSCOUNT ++

        if (fsCount === 7)
            FSCOUNT ++
    })

    d500.mre = ( d500.tre / d500.re ).toFixed(0);
    d1000.mre = ( d1000.tre / d1000.re ).toFixed(0);
    d1500.mre = ( d1500.tre / d1500.re ).toFixed(0);
    d2000.mre = ( d2000.tre / d2000.re ).toFixed(0);
    d3000.mre = ( d3000.tre / d3000.re ).toFixed(0);
    d5000.mre = ( d5000.tre / d5000.re ).toFixed(0);
    dGT5000.mre = ( dGT5000.tre / dGT5000.re ).toFixed(0);

    d500.mdo = ( d500.tdo / d500.re ).toFixed(0);
    d1000.mdo = ( d1000.tdo / d1000.re ).toFixed(0);
    d1500.mdo = ( d1500.tdo / d1500.re ).toFixed(0);
    d2000.mdo = ( d2000.tdo / d2000.re ).toFixed(0);
    d3000.mdo = ( d3000.tdo / d3000.re ).toFixed(0);
    d5000.mdo = ( d5000.tdo / d5000.re ).toFixed(0);
    dGT5000.mdo = ( dGT5000.tdo / dGT5000.re ).toFixed(0);

    console.log('---------------------------------------------\n');
    console.log('               navigationStart的垃圾数据有' + NSCOUNT + '%\n');
    console.log('               fetchStart的垃圾数据有' + FSCOUNT + '%\n');
    console.log('')
    console.log('               接受文档时间：\n')
    console.log('                   0     ~    500ms      ' + d500.re + '%')
    console.log('                   500ms ~    1s         ' + d1000.re + '%')
    console.log('                   1s    ~    1.5s       ' + d1500.re + '%')
    console.log('                   1.5s  ~    2s         ' + d2000.re + '%')
    console.log('                   2s    ~    3s         ' + d3000.re + '%')
    console.log('                   3s    ~    5s         ' + d5000.re + '%')
    console.log('                   5s    ~               ' + dGT5000.re + '%')
    console.log('')
    console.log('               最久接受文档时间：  ' + reLonggggggg + 'ms\n')
    console.log('')
    console.log('               接受文档平均时间 VS 渲染平均时间：\n');
    console.log('                   0     ~    500ms      ' + d500.mre + ' | ' + d500.mdo)
    console.log('                   500ms ~    1s         ' + d1000.mre + ' | ' + d1000.mdo)
    console.log('                   1s    ~    1.5s       ' + d1500.mre + ' | ' + d1500.mdo)
    console.log('                   1.5s  ~    2s         ' + d2000.mre + ' | ' + d2000.mdo)
    console.log('                   2s    ~    3s         ' + d3000.mre + ' | ' + d3000.mdo)
    console.log('                   3s    ~    5s         ' + d5000.mre + ' | ' + d5000.mdo)
    console.log('                   5s    ~               ' + dGT5000.mre + ' | ' + dGT5000.mdo)
    console.log('---------------------------------------------');
};