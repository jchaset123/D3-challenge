// D3-Challenge
var svgWidth = 1000;
var svgHeight = 550;

var margin = {
   top: 20,
   right: 40,
   bottom: 80,
   left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append SVG, and shift margin
var svg = d3
   .select("#scatter")
   .append("svg")
   .attr("width", svgWidth)
   .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
   .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// update xscale var on click
function xScale(healthData, chosenXAxis) {
   // scales
   var xLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, data => data[chosenXAxis]) * 0.8,
      d3.max(healthData, data => data[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
   return xLinearScale;
}
// update yscale var on click
function yScale(healthData, chosenYAxis) {
   // scales
   var yLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, data => data[chosenYAxis]) * 0.8,
      d3.max(healthData, data => data[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
   return yLinearScale;
}
// update x axis function
function renderXAxis(newXScale, xAxis) {
   var bottomAxis = d3.axisBottom(newXScale);
   xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
   return xAxis;
}
// update y axis function
function renderYAxis(newYScale, yAxis) {
   var leftAxis = d3.axisLeft(newYScale);
   yAxis.transition()
      .duration(1000)
      .call(leftAxis);
   return yAxis;
}
//  function to update circles to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
   circlesGroup.transition()
      .duration(1000)
      .attr("cx", data => newXScale(data[chosenXAxis]))
      .attr("cy", data => newYScale(data[chosenYAxis]))
   return circlesGroup;
}
//function update state label
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
   textGroup.transition()
      .duration(1000)
      .attr('x', data => newXScale(data[chosenXAxis]))
      .attr('y', data => newYScale(data[chosenYAxis]));
   return textGroup
}
// //function style xaxis tooltip
function styleX(value, chosenXAxis) {
   if (chosenXAxis === 'poverty') {
      return `${value}%`;
   }
   else if (chosenXAxis === 'age') {
      return `${value}`;
   }
   else {
      return `${value}`;
   }
}
// //function style xaxis tooltip
function styleY(value, chosenYAxis) {
   if (chosenYAxis === 'healthcare') {
      return `${value}%`;
   }
   else if (chosenYAxis === 'smokes') {
      return `${value}`;
   }
   else {
      return `${value}`;
   }
}
// function circle update via tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
   var xLabel;
   if (chosenXAxis === "poverty") {
      xLabel = "Poverty:";
   }
   else if (chosenXAxis === "age") {
      xLabel = "Age:";
   }
   else {
      xLabel = "Median Income";
   }
   var yLabel;
   if (chosenYAxis === 'healthcare') {
      yLabel = "Healthcare:"
   }
   else if (chosenYAxis === 'smokes') {
      yLabel = 'Smokes:';
   }
   else {
      yLabel = 'Obese:';
   }
   var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function (data) {
         return (`${data.state}<br>${xLabel} ${styleX(data[chosenXAxis], chosenXAxis)}<br>${yLabel} ${styleY(data[chosenYAxis], chosenYAxis)}`);
      });
   circlesGroup.call(toolTip);
   circlesGroup.on("mouseover", function (data) {
      toolTip.show(data, this);
   })
      // event the mouseout
      .on("mouseout", function (data, index) {
         toolTip.hide(data, this);
      });
   return circlesGroup;
}
// Retrieve CSV data/execute
d3.csv("data.csv").then(function (healthData, err) {
   if (err) throw err;
   console.log(healthData);
   // data parse
   healthData.forEach(function (data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.healthcare = +data.healthcare;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
   });
   // linearscale
   var xLinearScale = xScale(healthData, chosenXAxis);
   var yLinearScale = yScale(healthData, chosenYAxis);
   // initial xaxis function
   var bottomAxis = d3.axisBottom(xLinearScale);
   var leftAxis = d3.axisLeft(yLinearScale);
   // append x axis
   var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
   // append y axis
   var yAxis = chartGroup.append('g')
      .classed('y-axis', true)
      .call(leftAxis);
   // append initial circles
   var circlesGroup = chartGroup.selectAll("circle")
      .data(healthData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 20)
      .attr("fill", "lightblue")
      .attr("opacity", ".5");

   // xaxis group label
   var xLabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20 + margin.top})`);
   var povertyLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty")
      .classed("active", true)
      .text("In Poverty (%)");

   var ageLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age")
      .classed("inactive", true)
      .text("Age (Median)");

   var incomeLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income")
      .classed("inactive", true)
      .text("Income (Median)");

   // y label group
   var yLabelsGroup = chartGroup.append('g')
      .attr('transform', `translate(${0 - margin.left / 4}, ${height / 2})`);

   var healthcareLabel = yLabelsGroup.append('text')
      .classed('aText', true)
      .classed('active', true)
      .attr('x', 0)
      .attr('y', 0 - 20)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'healthcare')
      .text('Healthcare (%)');

   var smokesLabel = yLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 0 - 40)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'smokes')
      .text('Smoker (%)');

   var obesityLabel = yLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 0 - 60)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'obesity')
      .text('Obese (%)');

   // updatetooltip
   var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

   // xaxis listener
   xLabelsGroup.selectAll("text")
      .on("click", function () {
         //selection values
         var value = d3.select(this).attr("value");
         if (value !== chosenXAxis) {
            // replace x value
            chosenXAxis = value;
            // console.log(chosenXAxis)
            xLinearScale = xScale(healthData, chosenXAxis);
            xAxis = renderXAxis(xLinearScale, xAxis);
            // circle update
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            // update
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
            // class change
            if (chosenXAxis === 'poverty') {
               povertyLabel.classed('active', true).classed('inactive', false);
               ageLabel.classed('active', false).classed('inactive', true);
               incomeLabel.classed('active', false).classed('inactive', true);
            }
            else if (chosenXAxis === 'age') {
               povertyLabel.classed('active', false).classed('inactive', true);
               ageLabel.classed('active', true).classed('inactive', false);
               incomeLabel.classed('active', false).classed('inactive', true);
            }
            else {
               povertyLabel.classed('active', false).classed('inactive', true);
               ageLabel.classed('active', false).classed('inactive', true);
               incomeLabel.classed('active', true).classed('inactive', false);
            }
         }
      });
   //y axis event listiner
   yLabelsGroup.selectAll('text')
      .on('click', function () {
         var value = d3.select(this).attr("value");
         if (value !== chosenYAxis) {
            chosenYAxis = value;
            //update 
            yLinearScale = yScale(healthData, chosenYAxis);
            //update 
            yAxis = renderYAxis(yLinearScale, yAxis);
            //Udate circles
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            //update tooltips
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
            //Class change
            if (chosenYAxis === 'healthcare') {
               healthcareLabel.classed('active', true).classed('inactive', false);
               smokesLabel.classed('active', false).classed('inactive', true);
               obesityLabel.classed('active', false).classed('inactive', true);
            }
            else if (chosenYAxis === 'smokes') {
               healthcareLabel.classed('active', false).classed('inactive', true);
               smokesLabel.classed('active', true).classed('inactive', false);
               obesityLabel.classed('active', false).classed('inactive', true);
            }
            else {
               healthcareLabel.classed('active', false).classed('inactive', true);
               smokesLabel.classed('active', false).classed('inactive', true);
               obesityLabel.classed('active', true).classed('inactive', false);
            }
         }
      });
});
