import numpy as np

import physics
import animation


# Simulate
x0 = np.array([[0], [250], [0], [100]])  # initial state [[x], [vx], [y], [vy]]
dur = 9.0  # simulation duration, in seconds
dt = 0.01  # time step, in seconds
solution = physics.tagpro_simulate(x0, dur, dt)

# Visualize
animation.TagProAnimation(solution, dt)
