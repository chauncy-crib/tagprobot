import numpy as np

import physics
import animation


def without_control():
    # Simulate
    x0 = np.array([[0], [250], [0], [100]])  # initial state [[x], [vx], [y], [vy]]
    dur = 9.0  # time to run for, in seconds
    dt = 0.01  # time step, in seconds
    solution = physics.tagpro_simulate(x0, dur, dt)  # solved states over time

    # Visualize
    animation.TagProAnimation(solution, dt)


def with_control():
    # Simulate
    x0 = np.array([[0], [0], [0], [-100]])  # initial state [[x], [vx], [y], [vy]]
    goal = np.array([[100], [-50], [50], [-25]])  # goal state
    dur = 5  # time to run for, in seconds
    dt = 0.01  # time step, in seconds
    solution = physics.tagpro_simulate_with_control(x0, goal, dur, dt)  # solved states over time

    # Visualize
    animation.TagProAnimation(solution, dt, goal, save=False)


if __name__ == '__main__':
    with_control()
