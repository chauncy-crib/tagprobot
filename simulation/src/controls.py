import numpy as np


def dlqr(A, B, Q, F, R, goal, T):
    """ Run discrete linear quadratic regulator on the inputs to determine optimal K matrix for
    different deadlines from 0 to T """
    # A = [A, A @ goal - goal; 0, 1]
    A = np.append(A, (A @ goal) - goal, axis=1)
    A = np.append(A, np.append(np.zeros((1, A.shape[0])), [[1]], axis=1), axis=0)

    # B = [B; 0]
    B = np.append(B, np.zeros((1, B.shape[1])), axis=0)

    # Q =  [Q, 0; 0, 0]
    Q = np.append(Q, np.zeros((Q.shape[0], 1)), axis=1)
    Q = np.append(Q, np.zeros((1, Q.shape[1])), axis=0)

    # F =  [F, 0; 0, 0]
    F = np.append(F, np.zeros((F.shape[0], 1)), axis=1)
    F = np.append(F, np.zeros((1, F.shape[1])), axis=0)

    # Ps = [[0], [0], ... , [F]]
    Ps = np.zeros((T, Q.shape[0], Q.shape[1]))
    Ps[-1] = F

    Ks = np.zeros((T - 1, R.shape[0], A.shape[1]))

    for t in np.arange(start=T - 2, stop=0, step=-1):
        Ps[t] = (A.T @ Ps[t + 1] @ A) - (A.T @ Ps[t + 1] @ B) @ np.linalg.inv(R + B.T @
                Ps[t + 1] @ B) @ (B.T @ Ps[t + 1] @ A) + Q
        Ks[t] = np.linalg.inv(R + B.T @ Ps[t] @ B) @ (B.T @ Ps[t] @ A)

    return Ks
