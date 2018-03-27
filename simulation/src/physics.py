import sys
import numpy as np


def tagpro_simulate(x0, dur, dt):
    """ Return a matrix of states calculated using TagPro physics """
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

    curr_state = x0
    solution = curr_state
    for _ in range(samples):
        next_state = A @ curr_state
        solution = np.append(solution, next_state, axis=1)
        curr_state = next_state

    return solution
