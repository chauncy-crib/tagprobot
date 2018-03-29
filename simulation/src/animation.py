import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
from matplotlib import animation


class TagProAnimation(object):
    def __init__(self, states, dt, goal_state=None, save=False):
        self.states = states
        self.dt = dt
        self.goal_state = goal_state

        self.x, self.vx, self.y, self.vy = self.states[:, :, 0].T
        self.tagpro_ball = plt.Circle((0, 0), radius=19, facecolor=(1.0, 0.0, 0.0))

        # Plot
        sns.set()
        self.fig = plt.figure(figsize=(10, 12))
        self.plot_states()
        self.animate_states()

        if save:
            self.anim.save('tpb_animation.mp4', writer='ffmpeg')

        plt.show()

    def plot_states(self):
        """ Create plot of positions and velocities over time """
        # Setup axis
        self.ax1 = self.fig.add_subplot(2, 1, 1)
        self.ax1.set_title('State Over Time')
        self.ax1.set_xlabel('Time (seconds)')

        # Plot
        timespan = np.linspace(0, self.states.shape[0] * self.dt, self.states.shape[0])
        self.ax1.plot(timespan, self.x)
        self.ax1.plot(timespan, self.vx)
        self.ax1.plot(timespan, self.y)
        self.ax1.plot(timespan, self.vy)
        self.time_line, = self.ax1.plot([], [], '--')
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
        self.anim = animation.FuncAnimation(fig=self.fig, init_func=self.init_animation,
                func=self.update, frames=self.states.shape[0], interval=self.dt * 1000, blit=True)

    def init_animation(self):
        self.time_line.set_data([0, 0], self.ax1.get_ylim())

        self.tagpro_ball.center = (self.x[0], self.y[0])
        if self.goal_state is not None:  # add shadow of goal state
            goal_x, goal_vx, goal_y, goal_vy = self.goal_state[:, 0]
            goal_tagpro_ball = plt.Circle((goal_x, goal_y), radius=19, facecolor=(1.0, 0.0, 0.0),
                    alpha=0.1)
            self.ax2.add_patch(goal_tagpro_ball)
            self.ax2.arrow(goal_x, goal_y, goal_vx, goal_vy, width=1.0, head_width=10,
                    head_length=10, length_includes_head=True, fc='k', ec='k', alpha=0.2)
        self.ax2.add_patch(self.tagpro_ball)
        return (self.time_line, self.tagpro_ball)

    def update(self, i):
        self.time_line.set_xdata([i * self.dt, i * self.dt])
        self.tagpro_ball.center = (self.x[i], self.y[i])
        return (self.time_line, self.tagpro_ball)
