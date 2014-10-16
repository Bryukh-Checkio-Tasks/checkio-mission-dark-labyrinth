"""
CheckiOReferee is a base referee for checking you code.
    arguments:
        tests -- the dict contains tests in the specific structure.
            You can find an example in tests.py.
        cover_code -- is a wrapper for the user function and additional operations before give data
            in the user function. You can use some predefined codes from checkio.referee.cover_codes
        checker -- is replacement for the default checking of an user function result. If given, then
            instead simple "==" will be using the checker function which return tuple with result
            (false or true) and some additional info (some message).
            You can use some predefined codes from checkio.referee.checkers
        add_allowed_modules -- additional module which will be allowed for your task.
        add_close_builtins -- some closed builtin words, as example, if you want, you can close "eval"
        remove_allowed_modules -- close standard library modules, as example "math"

checkio.referee.checkers
    checkers.float_comparison -- Checking function fabric for check result with float numbers.
        Syntax: checkers.float_comparison(digits) -- where "digits" is a quantity of significant
            digits after coma.

checkio.referee.cover_codes
    cover_codes.unwrap_args -- Your "input" from test can be given as a list. if you want unwrap this
        before user function calling, then using this function. For example: if your test's input
        is [2, 2] and you use this cover_code, then user function will be called as checkio(2, 2)
    cover_codes.unwrap_kwargs -- the same as unwrap_kwargs, but unwrap dict.

"""

from checkio.signals import ON_CONNECT
from checkio import api
from checkio.referees.multicall import CheckiORefereeMulti
from checkio.referees import cover_codes
from checkio.referees import checkers

from tests import TESTS

DIRS = {"N": (-1, 0), "S": (1, 0), "W": (0, -1), "E": (0, 1)}

PLAYER = "P"
WALL = "X"
UNKNOWN = "?"
EXIT = "E"
EMPTY = "."
MAX_STEP = 250

def clear_zone(zone):
    count = 0
    shift = 0
    while count < len(zone):
        if all(el == UNKNOWN for el in zone[count]):
            zone.pop(count)
            if not count:
                shift += 1
        else:
            count += 1
    return shift

def get_visible(maze, player):
    grid = [["?" for _ in range(len(row))] for row in maze]
    grid[player[0]][player[1]] = PLAYER
    for direction, diff in DIRS.items():
        r, c = player
        while maze[r][c] != WALL:
            r, c = r + diff[0], c + diff[1]
            grid[r][c] = maze[r][c]
            if direction in "NS":
                grid[r + DIRS["W"][0]][c + DIRS["W"][1]] = maze[r + DIRS["W"][0]][c + DIRS["W"][1]]
                grid[r + DIRS["E"][0]][c + DIRS["E"][1]] = maze[r + DIRS["E"][0]][c + DIRS["E"][1]]
            else:
                grid[r + DIRS["S"][0]][c + DIRS["S"][1]] = maze[r + DIRS["S"][0]][c + DIRS["S"][1]]
                grid[r + DIRS["N"][0]][c + DIRS["N"][1]] = maze[r + DIRS["N"][0]][c + DIRS["N"][1]]
    row_shift = clear_zone(grid)
    grid = list(zip(*grid))
    col_shift = clear_zone(grid)
    return ["".join(trow) for trow in zip(*grid)], row_shift, col_shift


def initial(data):
    grid, row, col = get_visible(data["maze"], data["player"])
    return {"input": grid, "player": data["player"], "old_player": data["player"],
            "maze": data["maze"], "old_shifts": [row, col], "shifts": [row, col], "step": 0}


def process(data, user_result):
    maze = data["maze"]
    player = data["player"]
    data["old_player"] = player
    step = data["step"]
    data["old_shifts"] = data["shifts"]
    if not isinstance(user_result, str) or any(ch not in DIRS.keys() for ch in user_result):
        data.update({
            "result": False,
            "result_addon": "The function should return a string with directions."
        })
        return data

    for act in user_result:
        if step >= MAX_STEP:
            data.update({
                "result": False,
                "result_addon": "You are tired and your flashlight is off. Bye bye."
            })
            return data
        r, c = player[0] + DIRS[act][0], player[1] + DIRS[act][1]
        if maze[r][c] == WALL:
            data.update({
                "result": False,
                "result_addon": "BAM! You in the wall at {}, {}.".format(r, c)
            })
            return data
        elif maze[r][c] == EXIT:
            data.update({
                "result": True,
                "result_addon": "GRATZ!",
                "is_win": True
            })
            return data
        else:
            player = r, c
            step += 1

    grid, row_shift, col_shift = get_visible(maze, player)
    data.update({
        "result": True,
        "result_addon": "Next iteration",
        "player": player,
        "input": grid,
        "shifts": [row_shift, col_shift],
        "step": step
    })
    return data


def is_win(data):
    return data.get("is_win", False)

cover = """def cover(f, data):
    return f(tuple(str(row) for row in data))
"""

api.add_listener(
    ON_CONNECT,
    CheckiORefereeMulti(
        tests=TESTS,
        cover_code={
            'python-27': cover,  # or None
            'python-3': cover
        },
        initial_referee=initial,
        process_referee=process,
        is_win_referee=is_win,
        function_name="find_path"
    ).on_ready)

