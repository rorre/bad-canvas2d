# Bad Canvas2D!!

This is a reuse of another project of mine, that is [frames2osb](https://github.com/rorre/frames2osb)

The source code does **not** contain the frames data needed for the application to work, and you must
build it yourself. Here is a guide to build the data yourself.

# Building

## Requirements

You will need all the thing frames2osb needed, which is:

-   Python >=3.8
-   Ffmpeg

## Building Frames Data

1. Install frames2osb

```bash
$ pip install git+https://github.com/rorre/frames2osb.git
```

2. Build frames data (in frames2osb format)  
   Hint: You may stop (CTRL+C) when it tries to generate .osb

```bash
$ python -m frames2osb --video badapple.mp4 pixels 10 --splits 1 sample.osb
```

3. Convert frames data to JSON  
   This is due to the data still in the format of Python's NamedTuple. There is a script
   [convert.py](convert.py) that would convert this.

```bash
$ python convert.py <path-to-datas_0.dat>
```

4. Put `frames.gz` into the same directory as `index.html`.
