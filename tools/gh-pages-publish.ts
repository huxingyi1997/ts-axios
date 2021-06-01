const { cd, exec, echo, touch } = require("shelljs")

echo("Deploying docs!!!")
cd("docs")
touch(".nojekyll")
exec("git init")
exec("git add .")
exec('git config user.name "huxingyi1997"')
exec('git config user.email "huxingyi1997@sina.com"')
exec('git commit -m "docs(docs): update gh-pages"')
exec(
  `git push --force --quiet "git@github.com:huxingyi1997/ts-axios.git" master:gh-pages`
)
exec(
  `git push --force --quiet "git@gitee.com:hxy1997/ts-axios.git" master:gh-pages`
)
echo("Docs deployed!!")
