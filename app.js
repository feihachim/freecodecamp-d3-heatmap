"use strict";

const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
let baseTemp;
let dataset;

let xScale;
let yScale;

let minYear;
let maxYear;
let numberOfYears;

const width = 1200;
const height = 600;
const padding = 60;

const canvas = d3.select("#canvas");
const tooltip = d3.select("#tooltip");

canvas.attr("width", width).attr("height", height);

const generateScales = () => {
  minYear = d3.min(dataset, (item) => item["year"]);
  maxYear = d3.max(dataset, (item) => item["year"]);
  numberOfYears = maxYear - minYear;

  xScale = d3
    .scaleLinear()
    .domain([minYear, maxYear + 1])
    .range([padding, width - padding]);

  yScale = d3
    .scaleTime()
    .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
    .range([padding, height - padding]);
};

const drawCells = () => {
  canvas
    .selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("fill", (item) => {
      switch (true) {
        case item["variance"] <= -1:
          return "SteelBlue";
        case item["variance"] <= 0:
          return "LightSteelBlue";
        case item["variance"] <= 1:
          return "Orange";
        default:
          return "Crimson";
      }
    })
    .attr("data-year", (item) => item["year"])
    .attr("data-month", (item) => item["month"] - 1)
    .attr("data-temp", (item) => item["variance"] + baseTemp)
    .attr("height", (height - padding * 2) / 12)
    .attr("y", (item) => yScale(new Date(0, item["month"] - 1, 0, 0, 0, 0, 0)))
    .attr("width", (item) => (width - padding * 2) / numberOfYears)
    .attr("x", (item) => xScale(item["year"]))
    .on("mouseover", (event, item) => {
      tooltip.transition().style("visibility", "visible");

      let monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      tooltip
        .text(
          `${item["year"]} ${monthNames[item["month"] - 1]} - ${
            baseTemp + item["variance"]
          }°C (${item["variance"]})`
        )
        .attr("data-year", item["year"]);
    })
    .on("mouseout", (event, item) => {
      tooltip.transition().style("visibility", "hidden");
    });
};

const drawAxes = () => {
  let xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
  let yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%B"));

  canvas
    .append("g")
    .call(xAxis)
    .attr("id", "x-axis")
    .attr("transform", `translate(0,${height - padding})`);

  canvas
    .append("g")
    .call(yAxis)
    .attr("id", "y-axis")
    .attr("transform", `translate(${padding},0)`);
};

d3.json(url).then((data) => {
  baseTemp = data.baseTemperature;
  dataset = data.monthlyVariance;

  generateScales();
  drawCells();
  drawAxes();
});
