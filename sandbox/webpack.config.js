module.exports = {
  // devtool: "eval-source-map",
  entry: "./index.ts",
  mode: "development",
  module: {
    rules: [
      {
        test: /(\.tsx?|\.js)$/,
        exclude: new RegExp(`node_modules`),
        use: {
          loader: require.resolve("babel-loader"),

          options: {
            presets: ["@babel/typescript", "@babel/react"],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js", ".tsx"],
  },
  target: "web",

  devServer: {
    port: 8082,
  },
}
