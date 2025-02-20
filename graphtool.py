from graph_tool.all import load_graph
from graph_tool.draw import graph_draw

g = load_graph("./cleaned.dot", fmt="dot")

# Save as PNG
graph_draw(g, output="graph.png", output_size=(1000, 1000))

# Save as SVG
graph_draw(g, output="graph.svg")
