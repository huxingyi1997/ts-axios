#!/usr/bin/env sh
set -e
echo "Enter release version: "
read VERSION
read -p "Releasing $VERSION - are you sure? (y/n)" -n 1 -r
echo  # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo "Releasing $VERSION ..."

  # commit
  git add -A
  git commit -m "[build] $VERSION"
  npm version $VERSION --message "[release] $VERSION"
  git push origin master
  npm config set registry=http://registry.npmjs.org

  # publish
  npm publish
  npm config set registry https://registry.npm.taobao.org
fi