module.exports = {
  devtool: "eval-source-map",
  entry: "./index.ts",
  mode: "development",
  module: {
    rules: [
      {
        test: /(\.ts|\.js)$/,
        exclude: new RegExp(
          `node_modules`
        ),
        use: {
          loader: require.resolve("babel-loader"),

          options: {
            presets: ["@babel/typescript"],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  target: "web",

  devServer: {
    port: 8081,
  },
}
