import json
import os
import pickle
from typing import List, cast, NamedTuple
import sys
from frames2osb.helper import ListProgressBar, sort_datas
from frames2osb.quadtree.typings import FrameData, QuadNode
import zlib


class Point(NamedTuple):
    x: float
    y: float
    w: float
    h: float
    alpha: float


Keyframes = List[List[Point]]


def generate_particles(frame: FrameData, keyframes: Keyframes):
    qtree: QuadNode = frame.quadtree

    if qtree.final:
        mean_alpha = cast(int, qtree.mean.item())
        alpha = round(mean_alpha / 255, 2)
        if alpha == 0:
            return

        keyframes[frame.offset].append(
            Point(
                x=qtree.x,
                y=qtree.y,
                w=qtree.w,
                h=qtree.h,
                alpha=alpha,
            )
        )
    else:
        for q in (qtree.tl, qtree.tr, qtree.bl, qtree.br):
            if q:
                generate_particles(FrameData(frame.offset, q), keyframes)


def generate():
    basedir = sys.argv[1]
    data_files = os.listdir(basedir)
    data_files.sort(key=sort_datas)

    keyframes: Keyframes = [[] for _ in range(6572)]

    for data_file in ListProgressBar(data_files):
        with open(os.path.join(basedir, data_file), "rb") as f:
            frame_data: List[FrameData] = pickle.load(f)

        for frame in frame_data:
            generate_particles(frame, keyframes)
            del frame

        del frame_data

    with open("frames.gz", "wb") as f:
        f.write(zlib.compress(json.dumps(keyframes).encode()))


generate()
