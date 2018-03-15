""" File to define controls-related functions. """

import numpy as np


def dlqr(A, B, Q, R, goal):
    """ Run discrete linear quadratic regulator on the inputs to determine optimal K matrix. """
    # A = [A, A @ goal - goal; 0, 1]
    A = np.append(A, A @ goal - goal, axis=1)
    A = np.append(A, np.append(np.zeros((1, A.shape[0])), [[1]], axis=1), axis=0)

    # B = [B; 0]
    B = np.append(B, np.zeros((1, B.shape[1])), axis=0)

    # Q =  [Q, 0; 0, 0]
    Q = np.append(Q, np.zeros((Q.shape[0], 1)), axis=1)
    Q = np.append(Q, np.zeros((1, Q.shape[1])), axis=0)
    P = Q
    T = 1000

    for _ in range(T):
        P = (A.T @ P @ A) - (A.T @ P @ B) @ np.linalg.inv(R + (B.T @ P @ B)) @ (B.T @ P @ A) + Q

    K = np.linalg.inv(R + B.T @ P @ B) @ (B.T @ P @ A)

    return K


if __name__ == '__main__':
    # DLQR example
    dt = 0.1
    A = np.array([
        [1, dt, 0,  0],
        [0,  1, 0,  0],
        [0,  0, 1, dt],
        [0,  0, 0,  1]])
    B = np.array([
        [ 0,  0],
        [dt,  0],
        [ 0,  0],
        [ 0, dt]])
    Q = np.diag([10, 1, 10, 1])
    R = np.diag([1, 1])
    goal = np.array([[1], [0], [1], [0]])
    K = dlqr(A, B, Q, R, goal)

    print('A =')
    print(A)
    print('B =')
    print(B)
    print('Q =')
    print(Q)
    print('R =')
    print(R)
    print('goal =')
    print(goal)
    print('K =')
    print(K)
