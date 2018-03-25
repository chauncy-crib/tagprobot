import sys
import numpy as np
import matplotlib.pyplot as plt
from matplotlib import animation
import seaborn as sbs


def init_animation():
    patch.center = (0, 0)
    ax2.add_patch(patch)
    return patch,


def animate(i):
    x = pos_x[i]
    y = pos_y[i]
    patch.center = (x, y)
    return patch,


if __name__ == '__main__':
    # Calculate solution
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
    pos_x, vel_x, pos_y, vel_y = solution

    # Plot
    sbs.set()
    fig = plt.figure(figsize=(10, 12))

    ax1 = fig.add_subplot(2, 1, 1)
    ax1.plot(pos_x)
    ax1.plot(vel_x)
    ax1.plot(pos_y)
    ax1.plot(vel_y)
    ax1.set_title('State Over Time')
    ax1.set_xlabel('Time (seconds)')
    ax1.legend(['x Position (pixels)', 'x Velocity (pixels/second)', 'y Position (pixels)',
        'y Velocity (pixels/second)'])

    ax2 = fig.add_subplot(2, 1, 2)
    ax2.set_title('Animation')
    ax2.set_xlabel('x Position (pixels)')
    ax2.set_ylabel('y Position (pixels)')
    ax2.set_xlim(np.amin(pos_x) - 40, np.amax(pos_x) + 40)
    ax2.set_ylim(np.amin(pos_y) - 40, np.amax(pos_y) + 40)
    ax2.set_aspect('equal')
    patch = plt.Circle((0, 0), radius=19, facecolor=(1.0, 0.0, 0.0))
    anim = animation.FuncAnimation(fig, animate, init_func=init_animation, frames=samples,
        interval=1000 * dt, blit=True)
    # anim.save('../media/sim_2d.gif', dpi=80, writer='imagemagick')  # saves animation as a gif

    plt.show()
