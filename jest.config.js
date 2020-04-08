module.exports = {
    "moduleFileExtensions": [
        "js",
        "ts",
        "tsx"
    ],
    "transform": {
        "^.+\\.tsx?$": "ts-jest",
    },
    "testMatch": [
        "<rootDir>/tests/**/*.test.ts?(x)"
    ],
    "coverageDirectory": "<rootDir>/dist/coverage"
}