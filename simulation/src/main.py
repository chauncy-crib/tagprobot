import numpy as np

import physics
import animation


def without_lqr(save):
    """ Simulates and visualizes a TagPro ball of the specified initial state for the specified
    duration """
    # Simulate
    x0 = np.array([[0], [250], [0], [100]])  # initial state [[x], [vx], [y], [vy]]
    dur = 9.0  # time to run for, in seconds
    dt = 0.01  # time step, in seconds
    solution = physics.tagpro_simulate(x0, dur, dt)  # solved states over time

    # Visualize
    animation.TagProAnimation(solution, dt, save=save)


def with_lqr(save):
    """ Simulates and visualizes a TagPro ball of the specified initial state for the specified
    duration, using an LQR controller to attempt to reach the specified goal state """
    # Simulate
    x0 = np.array([[0], [0], [0], [-100]])  # initial state [[x], [vx], [y], [vy]]
    goal = np.array([[100], [-50], [50], [-25]])  # goal state
    dur = 5  # time to run for, in seconds
    dt = 0.01  # time step, in seconds
    solution = physics.tagpro_simulate_with_control(x0, goal, dur, dt)  # solved states over time

    # Visualize
    animation.TagProAnimation(solution, dt, goal_state=goal, save=save)


if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--lqr", action="store_true", help="run LQR to a goal position")
    parser.add_argument("--save", action="store_true", help="save the animation as tpb_anim.mp4")
    args = parser.parse_args()

    if args.lqr:
        with_lqr(args.save)
    else:
        without_lqr(args.save)
