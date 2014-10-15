"""
TESTS is a dict with all you tests.
Keys for this will be categories' names.
Each test is dict with
    "input" -- input data for user function
    "answer" -- your right answer
    "explanation" -- not necessary key, it's using for additional info in animation.
"""

TESTS = {
    "0. Simple": {
        "maze": [
            "XXXXXXX",
            "X.....X",
            "X.X.X.X",
            "X.....X",
            "X.X.X.X",
            "X.X.E.X",
            "XXXXXXX",
        ],
        "player": [1, 1]
    }
}
