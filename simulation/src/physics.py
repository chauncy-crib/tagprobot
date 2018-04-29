import sys
import numpy as np

import controls


def clip_accel(accel):
    max_accel = 150
    return max(min(max_accel, accel), -max_accel)


def clip_vel(vel):
    max_vel = 250
    return max(min(max_vel, vel), -max_vel)


def tagpro_simulate(x0, dur, dt):
    """ Return a matrix of states calculated using TagPro physics """
    if not (dur / dt).is_integer():
        print('ERROR: (dur / dt) is not an integer')
        sys.exit()
    else:
        T = int(dur / dt)  # the number of samples in the simulation

    b = 0.50  # damping coefficient
    A = np.array([  # difference equations
        [1,         dt, 0,          0],   # x = x + (dx/dt * dt)
        [0, 1 - b * dt, 0,          0],   # dx/dt = dx/dt + (dx/dt * (-b * dt))
        [0,          0, 1,         dt],   # y = y + (dy/dt * dt)
        [0,          0, 0, 1 - b * dt]])  # dy/dt = dx/dt + (dy/dt * (-b * dt))

    curr_state = x0
    solution = np.array([curr_state])
    for _ in range(T - 1):
        next_state = A @ curr_state
        solution = np.append(solution, [next_state], axis=0)
        curr_state = next_state

    return solution


def tagpro_simulate_with_control(x0, goal, dur, dt):
    """ Return a matrix of states calculated using TagPro physics """
    if not (dur / dt).is_integer():
        print('ERROR: (dur / dt) is not an integer')
        sys.exit()
    else:
        T = int(dur / dt)  # the number of samples in the simulation

    b = 0.50  # damping coefficient
    A = np.array([  # difference equations
        [1,            dt, 0,             0],   # x = x + (dx/dt * dt)
        [0, 1 + (-b * dt), 0,             0],   # dx/dt = dx/dt + (dx/dt * (-b * dt))
        [0,             0, 1,            dt],   # y = y + (dy/dt * dt)
        [0,             0, 0, 1 + (-b * dt)]])  # dx/dt = dx/dt + (dy/dt * (-b * dt))

    B = np.array([  # matrix to apply our control signal to our state
        [ 0,  0],
        [dt,  0],
        [ 0,  0],
        [ 0, dt]])

    Q = np.diag([0, 0, 0, 0])  # intermediate state cost

    F = np.diag([1000, 1000, 1000, 1000])  # terminal state cost

    R = np.diag([1, 1])  # control cost

    Ks = controls.dlqr(A, B, Q, F, R, goal, T)

    xs = np.zeros((T, x0.shape[0], x0.shape[1]))
    xs[0] = x0

    us = np.zeros((T - 1, Ks.shape[1], x0.shape[1]))

    for t in range(T - 1):
        x = np.append(xs[t] - goal, np.array([[1]]), axis=0)
        us[t] = -Ks[t] @ x
        us[t, 0, 0] = clip_accel(us[t, 0, 0])  # clip x acceleration
        us[t, 1, 0] = clip_accel(us[t, 1, 0])  # clip y acceleration

        xs[t + 1] = (A @ xs[t]) + (B @ us[t])
        xs[t + 1, 1, 0] = clip_vel(xs[t + 1, 1, 0])  # clip x velocity
        xs[t + 1, 3, 0] = clip_vel(xs[t + 1, 3, 0])  # clip x velocity

    return (xs, us)
