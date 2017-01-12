var graphic = function( exports ){
    

    exports.init = function( scene, xy ){
        d3.csv("../../taxi/busstationdata/dayDistricts_reduced.csv", function (data) {
            var range = [0,10,20,30,40,50]; // every 10 minutes

            var nested_data_count = d3.nest().key(function (d) { 
      
            var splited = d.originTime.split(":");
            var parse = parseInt(splited[1]);
            var currentIndex = range.length - 1;
            for (var i = 0; i < range.length - 1; i++) 
                currentIndex = parse > range[i] && parse < range[i+1]? i : currentIndex;
            
            return splited[0] + ":" + range[currentIndex]; 

            }).rollup(function (v) { return v.length; }).sortKeys(d3.ascending).entries(data);

            // console.log(nested_data_count);
            initBarChart( nested_data_count );
            
            animateBarChart();
        });
    };

    function initBarChart(data){
        this.data = data;
        var margin = {top: 40, right: 40, bottom: 30, left: 30};
        var width = $('.graph').width();

        var height = 200 - margin.top - margin.bottom;
        var barWidth = 3;
        var barMargins = 2;
        var ticksValues = [0, 75, 150];
        var resetTicksValues = [0, 75, 150];

        var dateValues = [ new Date('2015-07-01 00:1:00'), new Date('2015-07-01 03:0:00'), new Date('2015-07-01 06:0:00'), new Date('2015-07-01 09:0:00'), new Date('2015-07-01 12:0:00'), new Date('2015-07-01 15:0:00'), new Date('2015-07-01 18:0:00'), new Date('2015-07-01 21:0:00')];
        var intermediumValues = [ new Date('2015-07-01 01:0:00'), new Date('2015-07-01 02:0:00'), new Date('2015-07-01 04:0:00'), new Date('2015-07-01 05:0:00'), new Date('2015-07-01 07:0:00'), new Date('2015-07-01 8:0:00'), new Date('2015-07-01 10:0:00'), new Date('2015-07-01 11:0:00'), new Date('2015-07-01 13:0:00'),new Date('2015-07-01 14:0:00'),new Date('2015-07-01 16:0:00'),new Date('2015-07-01 17:0:00'), new Date('2015-07-01 19:0:00'),new Date('2015-07-01 20:0:00'),new Date('2015-07-01 22:0:00'),new Date('2015-07-01 23:0:00')];

        var date_format = d3.time.format("%-Hh");

        var dates = [ new Date(data[0].key+":00"), new Date(data[data.length-1].key+":00") ];
        
        var x = d3.time.scale()
                .domain(dates)
                .range([0, width]);
        
        var y = d3.scale.linear()
            .range([height, 0])

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            // .ticks(10)
            .tickSize(0)
            .tickValues(dateValues)
            .tickFormat(date_format)

        var yAxis = d3.svg.axis()
            // .ticks(5)
            .tickSize(0)
            .tickValues(ticksValues)
            .scale(y)
            .orient("left")

        var svg = d3.select(".graph").append("svg").attr("class", "barchart")
            .attr("width", width + margin.left + margin.right )
            .attr("height", height + 100 )
            .append("g")
            .attr("class", "yaxis")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //dingyh TODO    
        // var tip = d3.tip()
        //     .attr('class', 'd3-tip')
        //     .offset([-10, 0])
        //     .html(function(d) {
        //     return "<span class='tip-highlight'>" + d.values + "</span> active cars at " + moment(d.key).format("H:mm");
        //     })

        // svg.call(tip);

        var hoverLine = svg.append("line")          // attach a line
            .style("stroke", "rgba(255,255,255,0.3)")  // colour the line
            .attr("x1", 1)     // x position of the first end of the line
            .attr("y1", y(0))      // y position of the first end of the line
            .attr("x2", width + barWidth + 2)     // x position of the second end of the line
            .attr("y2", y(0))
            .attr("class", "hover-line")

            // x.domain( data.map(function (d) { return new Date(d.key + ":00"); }));
            x.domain(d3.extent(data, function(d) { return new Date(d.key + ":00"); }));
            y.domain( [0, d3.max(data, function (d) { return d.values; })]);

            
            var grid = svg.append("g");

            for (var i = 1; i < ticksValues.length; i++) {
            grid.append("line")          // attach a line
                .style("stroke", "rgba(255,255,255,0.25)")  // colour the line
                .attr("x1", 1)     // x position of the first end of the line
                .attr("y1", y(ticksValues[i]))      // y position of the first end of the line
                .attr("x2", width + barWidth + 2)     // x position of the second end of the line
                .attr("y2", y(ticksValues[i]))
                .attr("stroke-linecap", "round" )
                .attr("stroke-width", 1 )
                .attr("stroke-dasharray", "2, 2" )
                .attr("shape-rendering", "crispEdges" )
            };

            for (var i = 0; i < intermediumValues.length; i++) {
            svg.append("circle")          // attach a line
                .attr("cx", x(intermediumValues[i]))     // x position of the second end of the line
                .attr("cy", height + 17)
                .attr("r", '2')
                .attr("fill", 'rgba(255,255,255,0.3)')
            };
        
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + (height + 10) + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(-5,0)")
                .call(yAxis)

            svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function (d) { return x( new Date( d.key + ":00" )) + 1; })
                // .attr("x", function (d) { return MathUtilities.mapValues( x( new Date( d.key + ":00" )), width / data.length, width, 10, 30 );} )
                .attr("width", barWidth )
                .attr("y", function (d) { return y(d.values); })
                .attr("height", function(d) { return height - y(d.values); })
                .on('mouseover', function (d) { 
                
                tip.show(d); 

                for (var i = 0; i < ticksValues.length; i++)
                    if ( Math.abs(d.values - ticksValues[i]) < 10 ) ticksValues[i] = null;
                
                ticksValues[resetTicksValues.length] = d.values;

                hoverLine.style("stroke", "rgba(255,255,255,0.3)")
                hoverLine.attr("y1", y(d.values)).attr("y2", y(d.values))
                var tmp_svg = d3.select(".legend").transition(); 
                tmp_svg.select(".y.axis").duration(50).call(yAxis);
                })

                .on('mouseout', function (){ 
                hoverLine.style("stroke", "rgba(255,255,255,0)")
                tip.hide();
                for (var i = 0; i < ticksValues.length; i++) {
                    ticksValues[i] = resetTicksValues[i];
                };
                ticksValues[resetTicksValues.length] = null;
                var tmp_svg = d3.select(".legend").transition(); 
                tmp_svg.select(".y.axis").duration(50).call(yAxis);
                })

                .on("click", function (d) {
                row_counter = data.indexOf(d);
                currentFrame = row_counter;
                // context.clearRect(0,0,canvas.width, canvas.height );
                })

                barObjs = $('.bar');

        function type(d) {
            d.frequency = +d.frequency;
            return d;
        }
    }

    function animateBarChart(){
        var a_minute_last = 1000;
        
        var timer = setInterval( function () {
            
            updateTimeline();

        }, a_minute_last );
    }
    
    return exports;

}({});