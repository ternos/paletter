/**
 * Paletter: color tool
 * by Sergei Ternovykh / ternos@yandex-team.ru
 * @version 0.0.1
 * @homepage github.yandex-team.ru/ternos/paletter
 * Thanks Ian Bernatcki For a lot of ideas and cleanup
 */
'use strict';

var Paletter = function() {}

Paletter.getColors = function (url, callback, colorsQuantity) {
    if (colorsQuantity === undefined) {
        colorsQuantity = 1
    } else if (colorsQuantity > 6) {
        colorsQuantity = 6
    }

    this.onImageLoad(url, function() {
        var canvas = document.createElement('canvas'),
        context = canvas.getContext('2d'),
        width, height,
        rgb = []
    
        width = canvas.width = this.width
        height = canvas.height = this.height
    
        context.drawImage(this, 0, 0, 10, 10)
        
        var imageData = context.getImageData(0, 0, 10, 10),
            hsl = [],
            max = [],
            hueArray = {}
    
        for (var i = 1; i <= 36; i++) {
            hueArray[i * 10] = []
        }
    
        for (var i = 0; i < imageData.width; i++) {
            for (var j = 0, r, g, b, key; j < imageData.height; j++) {
                r = context.getImageData(i, j, 1, 1).data[0]
                g = context.getImageData(i, j, 1, 1).data[1]
                b = context.getImageData(i, j, 1, 1).data[2]
                rgb = [r,g,b]
                hsl = Paletter.rgb2hsl(rgb)
                key = Math.floor(hsl[0] / 10) * 10 + 10
                if(hueArray[key] !== undefined)
                    hueArray[key].push([hsl[0],hsl[1],hsl[2]])
                
                // Убиваем слишком тёмные/светлые тона
                // if (hsl[2] < 90 && hsl[2] > 10) {
                //         hueArray[key].push([hsl[0],hsl[1],hsl[2]])
                // }
                    
                }
            }

        var sort = Paletter.sortHue(hueArray)

        var colors = []
        for (var i = 1, z; i <= colorsQuantity; i++) {
            z = i - 1
            var j = Paletter.Average(hueArray[sort[z]])
            colors.push(j)
        }

        callback(colors)
    })
}

Paletter.sortHue = function (hueArray) {
    var sortable = [],
        key

    for (key in hueArray) {
        sortable.push([key, hueArray[key].length])
    }
    sortable.sort(function(a,b) { 
        return b[1] - a[1]
    })

    var finishSort = []
    for (var i = 0; i < sortable.length; i++) {
        finishSort.push(sortable[i][0])
    }
    
    return finishSort
}

Paletter.Average = function(colorArray) {
    var hueAvg = Paletter.median(colorArray.map(function (item) { return item[0] })),
        satAvg = Paletter.median(colorArray.map(function (item) { return item[1] })),
        ligAvg = Paletter.median(colorArray.map(function (item) { return item[2] })),
        hsl = [hueAvg, satAvg, ligAvg],
        rgb = Paletter.hsl2rgb(hsl)
    
    return rgb
        // console.log(Paletter.hsl2rgb(hsl), 'average function')
}

Paletter.onImageLoad = function (url, callback) {
    var image = document.createElement('img')
    image.crossOrigin = 'Anonymous'
    image.src = url.replace(/^url\(/, '').replace(/\)$/, '')
    image.onload = callback
}

Paletter.median = function (values) {
    values.sort( function(a,b) {return a - b;} );
    var half = Math.floor(values.length/2);
    if(values.length % 2)
        return values[half];
    else
        return (values[half-1] + values[half]) / 2.0;
}

Paletter.rgb2hsl = function (rgb) {
    var r = rgb[0] / 255
    var g = rgb[1] / 255
    var b = rgb[2] / 255

    var max = Math.max(r, g, b)
    var min = Math.min(r, g, b)
    var h
    var s
    var l = (max + min) / 2

    if (max === min) {
        h = s = 0
    } else {
        var d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

        if (max === r) {
            h = (g - b) / d + (g < b ? 6 : 0)
        } else if (max === g) {
            h = (b - r) / d + 2
        } else if (max === b) {
            h = (r - g) / d + 4
        }

        h /= 6
    }

    return [
        Math.round(h * 360),
        Math.round(s * 100),
        Math.round(l * 100)
    ]
}

Paletter.hsl2rgb = function (hsl) {

    var r
    var g
    var b

    var h = hsl[0] / 360
    var s = hsl[1] / 100
    var l = hsl[2] / 100

    if (s === 0) {
        r = g = b = l
    } else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s
        var p = 2 * l - q
        r = this.hue2rgb(p, q, h + 1/3)
        g = this.hue2rgb(p, q, h)
        b = this.hue2rgb(p, q, h - 1/3)
    }

    return [
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255)
    ]
}

Paletter.hue2rgb = function (p, q, t) {
    if(t < 0) t += 1;
    if(t > 1) t -= 1;
    if(t < 1/6) return p + (q - p) * 6 * t
    if(t < 1/2) return q
    if(t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
}