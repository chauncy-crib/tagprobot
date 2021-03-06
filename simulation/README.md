# TagProBot Simulation

A place to run simulations and create visuals.

## Setup

### Python3 Virtual Environment

#### Install
```bash
$ sudo add-apt-repository ppa:deadsnakes/ppa
$ sudo apt-get update
$ sudo apt-get install python3.6 python3.6-venv python3.6-tk
$ python3.6 -m venv env
$ source env/bin/activate
$ pip install --upgrade pip
$ pip install -r requirements.txt
```

#### Add package to requirements.txt
```bash
$ pip install PACKAGE_NAME
$ pip freeze > requirements.txt
```

## Run

To view a simulation, run
```bash
$ python src/main.py
```

There are currently two types of simulations that can be run:
* `python3.6 main.py`: simulation with initial state
* `python3.6 main.py --lqr`: simulation with initial state and goal state, using an LQR controller

Other flags:
* `--no-animate`: run the simulation without the animation
* `--save`: save the animation as tpb_anim.mp4
