import time
import math
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sbs
from matplotlib import animation
from scipy.integrate import odeint


def setup_time(start, stop, fs):
    """
    @param start - start time, in seconds
    @param stop - stop time, in seconds
    @param fs - sampling rate, in samples per second
    @returns a time array
    """
    num_samples = (stop - start) * fs
    time = np.linspace(start, stop, num_samples)

    return time


def derivs(x, t, b, A):
    """
    @param x - a vector of current state [x_pos, x_vel]
    @param t - current time in seconds
    @param b - damping coefficient
    @returns derivatives of x
    """
    x = np.array([[x[0]], [x[1]]])
    dxdt = A @ x

    return dxdt[:,0]


def init_animation():
    patch.center = (0, 0)
    ax2.add_patch(patch)
    return patch,


def animate(i):
    x = pos[i]
    patch.center = (x, 0)
    return patch,


if __name__ == '__main__':
    # Calculate solution
    fs = 30
    time = setup_time(start=0, stop=10, fs=fs)
    x0 = [0, 250] # initial condition
    b = 0.50 # damping coefficient
    A = np.array([[0, 1], [0, -b]])
    sol = odeint(derivs, x0, time, args=(b, A))
    pos, vel = sol.T

    # Plot
    sbs.set()
    fig = plt.figure()

    ax1 = fig.add_subplot(2, 1, 1)
    ax1.plot(sol)
    ax1.set_title('State Over Time')
    ax1.set_xlabel('Time (seconds)')
    ax1.legend(['Position (pixels)', 'Velocity (pixels/second)'])

    ax2 = fig.add_subplot(2, 1, 2)
    ax2.set_title('Animation')
    ax2.set_xlabel('x Position (pixels)')
    ax2.set_ylabel('y Position (pixels)')
    ax2.set_xlim(np.amin(pos) - 40, np.amax(pos) + 40)
    ax2.set_ylim(-40, 40)
    ax2.set_aspect('equal')
    patch = plt.Circle((0, 0), radius=19, facecolor=(1.0, 0.0, 0.0))
    anim = animation.FuncAnimation(fig, animate, init_func=init_animation, frames=sol.shape[0], interval=1000/fs, blit=True)
    # anim.save('../media/sim_1d.gif', dpi=80, writer='imagemagick') # saves animation as a gif

    plt.show()
