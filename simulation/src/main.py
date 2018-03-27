import sys
import numpy as np

import animation


x0 = np.array([[0], [250], [0], [100]])  # initial state
dur = 9.0  # simulation duration, in seconds
dt = 0.01  # time step
if not (dur / dt).is_integer():
    print('ERROR: (dur / dt) is not an integer')
    sys.exit()
else:
    samples = int(dur / dt)  # the number of samples in the simulation

b = 0.50  # damping coefficient
A = np.array([  # difference equations
    [1,         dt, 0,          0],   # x = x + (dx/dt * dt)
    [0, 1 - b * dt, 0,          0],   # dx/dt = dx/dt + (dx/dt * (-b * dt))
    [0,          0, 1,         dt],   # y = y + (dy/dt * dt)
    [0,          0, 0, 1 - b * dt]])  # dy/dt = dx/dt + (dy/dt * (-b * dt))

x_curr = x0
solution = x_curr
for _ in range(samples):
    x_next = A @ x_curr
    solution = np.append(solution, x_next, axis=1)
    x_curr = x_next

animation.TagProAnimation(solution, dt)
