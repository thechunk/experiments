'use strict';

class CircleVis {
    constructor(d3) {
        this.d3 = d3;
        this.width = this.height = 600;
        this.padding = 30;
        this.rad = this.width / 2;
        this.data = d3.range(0, 2 * Math.PI, 0.05).map(v => ({
            x: this.rad * Math.cos(v) + this.rad,
            y: this.rad * Math.sin(v) + this.rad,
            r: 5
        }));
        this.data.push({x: this.rad, y: this.rad, r: 3});

    }

    static drawContainer(d3, width, height) {
        const vis = d3.select('#dots')
            .append('svg');
        vis.attr('width', width)
            .attr('height', height)
            .attr('style', 'outline: thin solid black');
        return vis;
    }

    static initAxes(d3, vis, data, width, height, padding) {
        const xValues = data.map(d => +d.x),
            yValues = data.map(d => +d.y),
            xMax = d3.max(xValues),
            yMax = d3.max(yValues);
        const x = d3.scaleLinear()
            .domain([0, xMax])
            .range([padding, width - padding])
            .nice();
        const y = d3.scaleLinear()
            .domain([yMax, 0])
            .range([padding, height - padding])
            .nice();

        const xAxis = d3.axisBottom(x),
            yAxis = d3.axisLeft(y);
        vis.append('g')
            .attr('transform', `translate(0,${height-padding})`)
            .call(xAxis);
        vis.append('g')
            .attr('transform', `translate(${padding},0)`)
            .call(yAxis);

        return {x, y};
    }

    static drawDots(d3, vis, data, x, y, rad) {
        const c = vis.selectAll('circle')
            .data(data)
            .enter().append('svg:circle')
            .attr('cx', d => x(d.x))
            .attr('cy', d => y(d.y))
            .attr('r', d => d.r * 4)
            .style('opacity', 0);

        c.append('svg:title')
            .text(d => `${d.x},${d.y}`);

        c.transition()
            .duration(1000)
            .delay((d, i) => i * data.length * 0.1)
            .attr('r', d => d.r)
            .style('opacity', 1)
            .on('end', (d, i) => {
                if (i === data.length - 1) {
                    c.on('mouseover', function(d, i) {
                        CircleVis.handleDotMouseover(this, d3, vis, data, x, y, rad, d, i);
                    });
                    c.on('mouseout', CircleVis.handleDotMouseout);
                }
            });

    }

    static handleDotMouseover(target, d3, vis, data, x, y, r, d, i) {
        d3.select(target).transition()
            .ease(d3.easeElastic.period(1))
            .duration(500)
            .attr('r', d => d.r * 1.5);
        if (i < data.length - 1) {
            this.drawOverlay(vis, x, y, r, d, i);
        }
    }

    static handleDotMouseout(d, i) {
        d3.select(this).transition()
            .ease(d3.easeElastic.period(1))
            .duration(500)
            .attr('r', d.r);
        d3.selectAll(`#over-${i}`)
            .transition()
            .style('opacity', 0)
            .on('end', function() {
                d3.select(this).remove()
            });
        d3.selectAll(`#desc-${i}`)
            .transition()
            .style('opacity', 0)
            .on('end', function() {
                d3.select(this).remove();
            });
    }

    static drawOverlay(vis, x, y, r, d, i) {
        const xDx = x(d.x);
        const yDy = y(d.y);
        const data = [
            {x1: r, y1: r, x2: xDx, y2: yDy, stroke: 'black'},
            {x1: r, y1: r, x2: xDx, y2: r, stroke: 'red'},
            {x1: xDx, y1: r, x2: xDx, y2: yDy, stroke: 'blue'},
        ];
        const overlayGroup = vis.append('g')
            .attr('id', `over-${i}`);
        overlayGroup
            .selectAll('line')
            .data(data)
            .enter().append('line')
            .style('stroke', d => d.stroke)
            .attr('x1', d => d.x1)
            .attr('y1', d => d.y1)
            .attr('x2', d => d.x2)
            .attr('y2', d => d.y2);
        const descGroup = overlayGroup.append('g')
            .attr('transform', `rotate(
                                        ${this.radToDeg(Math.atan2(y(d.y) - r, x(d.x) - r))}
                                        ${(r + x(d.x)) / 2}
                                        ${(r + y(d.y)) / 2}
                                    )`)
            .attr('id', `desc-${i}`);
        const descText = descGroup.append('text');
        descText
            .attr('x', (r + x(d.x)) / 2)
            .attr('y', (r + y(d.y)) / 2)
            .text('hello');

        overlayGroup
            .style('opacity', 0)
            .transition()
            .style('opacity', 1);
        return overlayGroup;
    }

    static radToDeg(rad) {
        return rad * 180 / Math.PI;
    }

    main() {
        const vis = CircleVis.drawContainer(this.d3, this.width, this.height);
        const {x, y} = CircleVis.initAxes(this.d3, vis, this.data, this.width, this.height, this.padding);
        const dots = CircleVis.drawDots(this.d3, vis, this.data, x, y, this.rad);
    }
}