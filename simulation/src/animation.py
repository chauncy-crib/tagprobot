import numpy as np
import seaborn as sbs
import matplotlib.pyplot as plt
from matplotlib import animation


class TagProAnimation(object):
    def __init__(self, states, dt):
        self.states = states
        self.dt = dt

        self.x, self.vx, self.y, self.vy = self.states
        self.tagpro_ball = plt.Circle((0, 0), radius=19, facecolor=(1.0, 0.0, 0.0))

        # Plot
        sbs.set()
        self.fig = plt.figure(figsize=(10, 12))
        self.plot_states()
        self.animate_states()
        plt.show()

    def plot_states(self):
        """ Create plot of positions and velocities over time """
        # Setup axis
        self.ax1 = self.fig.add_subplot(2, 1, 1)
        self.ax1.set_title('State Over Time')
        self.ax1.set_xlabel('Time (seconds)')

        # Plot
        self.ax1.plot(self.x)
        self.ax1.plot(self.vx)
        self.ax1.plot(self.y)
        self.ax1.plot(self.vy)
        self.ax1.legend(['x Position (pixels)', 'x Velocity (pixels/second)', 'y Position (pixels)',
            'y Velocity (pixels/second)'])

    def animate_states(self):
        """ Create animated plot of positions over time """
        # Setup axis
        self.ax2 = self.fig.add_subplot(2, 1, 2)
        self.ax2.set_title('Animation')
        self.ax2.set_xlabel('x Position (pixels)')
        self.ax2.set_ylabel('y Position (pixels)')
        self.ax2.set_xlim(np.amin(self.x) - 40, np.amax(self.x) + 40)
        self.ax2.set_ylim(np.amin(self.y) - 40, np.amax(self.y) + 40)
        self.ax2.set_aspect('equal')

        # Plot
        self._ = animation.FuncAnimation(fig=self.fig, init_func=self.init_animation,
                func=self.update, frames=self.states.shape[1], interval=self.dt * 1000, blit=True)

    def init_animation(self):
        self.tagpro_ball.center = (self.x[0], self.y[0])
        self.ax2.add_patch(self.tagpro_ball)
        return self.tagpro_ball,

    def update(self, i):
        self.tagpro_ball.center = (self.x[i], self.y[i])
        return self.tagpro_ball,
