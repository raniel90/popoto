import './Popoto.css';
import * as d3 from 'd3';
import * as popoto from 'popoto';
import React, { Component } from 'react';

class Popoto extends Component {

    componentDidMount() {
        this.popotoConfig();
    }

    popotoConfig() {
        // Demo Neo4j database settings hosted on GrapheneDb
        popoto.rest.CYPHER_URL = "https://db-kh9ct9ai1mqn6hz2itry.graphenedb.com:24780/db/data/transaction/commit";
        popoto.rest.AUTHORIZATION = "Basic cG9wb3RvOmIuVlJZQVF2blZjV2tyLlRaYnpmTks5aHp6SHlTdXk=";
        // Define the list of label provider to customize the graph behavior:
        // Only two labels are used in Neo4j movie graph example: "Movie" and "Person"
        popoto.provider.node.Provider = {
            "Movie": {
                "returnAttributes": ["title", "released", "tagline"],
                "constraintAttribute": "title"
            },
            "Person": {
                "returnAttributes": ["name", "born"],
                "constraintAttribute": "name",
                // Customize result display for Person nodes:
                "displayResults": function (pResultElmt) {
                    // Here D3.js mechanisms is used to generate HTML code.
                    // By default Popoto.js generates a <p> element for each result.
                    // pResultElmt parameter is the <p> element selected with D3.js
                    // So for "Person" result nodes two elements are generated:
                    // An <h3> element containing the person name
                    pResultElmt.append("h3")
                        .text(function (result) {
                            return result.attributes.name;
                        });
                    // A <span> element with the computed age from born attribute
                    pResultElmt.filter(function (result) {
                        // Filter on attribute having born attribute value
                        return result.attributes.born;
                    }).append("span").text(function (result) {
                        return "Age: " + (new Date().getFullYear() - result.attributes.born);
                    });
                }
            }
        };
        // Change the number of displayed results:
        popoto.result.RESULTS_PAGE_SIZE = 20;
        // Add a listener on returned result count to update count in page
        popoto.result.onTotalResultCount(function (count) {
            d3.select("#rescount").text(function (d) {
                return "(" + count + ")";
            })
        });
        // Add a listener on new relation added
        popoto.graph.on(popoto.graph.Events.GRAPH_NODE_RELATION_ADD, function (relations) {
            var newRelation = relations[0];
            // Collapse all expanded choose nodes first to avoid having value node in selection.
            popoto.graph.node.collapseAllNode();
            var linksToRemove = popoto.dataModel.links.filter(function (link) {
                // All other links starting from same source node except new one.
                return link !== newRelation && link.source === newRelation.source;
            });
            linksToRemove.forEach(function (link) {
                var willChangeResults = popoto.graph.node.removeNode(link.target);
                popoto.result.hasChanged = popoto.result.hasChanged || willChangeResults;
            });
            popoto.update();
        });
        // Start the generation using parameter as root label of the query.
        popoto.start("Person");
    }

    render() {

        return (
            <div>
                <section className="ppt-section-main">
                    <div className="ppt-section-header">
                        <span className="ppt-header-span">Pentaho Day Neo4j</span>
                    </div>

                    <div id="popoto-graph" className="ppt-div-graph">
                    </div>

                    <div id="popoto-cypher" className="ppt-container-query">
                    </div>

                    <div className="ppt-section-header">
                        RESULTS <span id="rescount" className="ppt-count"></span>
                    </div>

                    <div id="popoto-results" className="ppt-container-results">
                    </div>

                </section>
            </div>
        )
    }
}

export default Popoto;