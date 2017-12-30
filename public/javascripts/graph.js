window.onload = function () {
    var socket = io.connect("http://127.0.0.1:80");



    $(".load-graph").on("click", function () {
        var searched = $("#character").val();
        if(searched.length){
            socket.emit("draw", {'searched': searched, 'new_search': 'yes'});
        }
        else{
            alert("Please enter a search term to begin");
        }
    });

    var t = -1,
        n = 40,
        duration = 750,
        data = [];

    var margin = {
            top: 6,
            right: 0,
            bottom: 20,
            left: 40
        },
        width = 560 - margin.right,
        height = 120 - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .domain([t - n + 1, t])
        .range([0, width]);

    var y = d3.time.scale()
        .range([height, 0])
        .domain([1, 10]);

    var line = d3.svg.line()
        .interpolate("basis")
        .x(function (d, i) {
            return x(d.time);
        })
        .y(function (d, i) {
            return y(d.value);
        });

    var svg = d3.select("body").append("p").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("margin-left", -margin.left + "px")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    var xAxis = d3.svg.axis().scale(x).orient("bottom");
    var axis = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(x.axis = xAxis);

    var yAxis = d3.svg.axis().scale(y).orient('left').tickSize(0, 0).ticks(4).tickFormat(function (d) {
        return d * 1;
    });
    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('dx', (0 - height / 2))
        .attr('dy', '-2.8em')
        .style('text-anchor', 'middle');

    var path = svg.append("g")
        .attr("clip-path", "url(#clip)")
        .append("path")
        .data([data])
        .attr("class", "line");

    function tick(searched) {

        // update the domains
        x.domain([t - n + 2, t]);
        // redraw the line
        svg.select(".line")
            .attr("d", line)
            .attr("transform", null);

        // slide the x-axis left
        axis.transition()
            .duration(duration)
            .ease("linear")
            .call(x.axis);

        // slide the line left
        path.transition()
            .duration(duration)
            .ease("linear")
            .attr("transform", "translate(" + x(t - n) + ")")
            .each("end", tick);

        socket.emit("draw", {'searched': searched, 'new_search': 'no'});
        // pop the old data point off the front
        if (data.length > 40) {
            data.shift();
        }

    }


    socket.on("text", function (response) {
        var searched = response.searched;
        data.push({
            time: ++t,
            value: parseInt(response.data)
        });
        tick(searched);
    });


};