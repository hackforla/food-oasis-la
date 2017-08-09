
# Food Oasis

This is a website with a map of food sources in Los Angeles, and list of resources about food deserts and health. You can view the site here…
https://foodoasis.la

## How to make changes

The website is published with [GitHub Pages](https://pages.github.com), and the files are generated with [Jekyll](http://jekyllrb.com).

As you make changes and commit/push them to GitHub, the [staging website](https://staging.foodoasis.la) will automatically update. You can also manually push your changes to the [live website](https://github.com/foodoasisla/foodoasis.la).

## How to develop locally

If you want to see a preview of your changes while you work, you can [run a Jekyll server](https://jekyllrb.com) on your local machine. [Installing Ruby and Jekyll](https://jekyllrb.com/docs/installation/) is a good place to start.

You can start running the Jekyll application like this...

```git clone https://github.com/foodoasisla/site.git```

```npm install```

```npm start```

That will start Jekyll with a special configuration that skips these files (since they take a long time to create)…

```
api/*
locations/*
community-garden/*
farmers-market/*
food-pantry/*
summer-lunch/*
supermarket/*
sitemap.xml
```

If those folders are already present, your local website should still work great (though the files in those folders may not be the latest).

Here’s one more command skips the initial build of the food location files, if you want to start up quickly.

```rake fast```

## Handy Guides

* [Markdown](https://guides.github.com/features/mastering-markdown/)
* [Liquid](https://shopify.github.io/liquid/)
* [Liquid for Designers](https://github.com/Shopify/liquid/wiki/Liquid-for-Designers)
* [Jekyll](https://jekyllrb.com/docs/home/)

## A summary of the project files

### Files for Jekyll
```
_config.yml
_config_dev.yml
_data/*
_drafts/*
_includes/*
_layouts/*

```

### Files for Node.js
```
_node/*
```

### Files [generated by Node.js](#how-to-add-a-new-location), for Jekyll
```
_locations/*
_community-garden/*
_farmers-market/*
_food-pantry/*
_summer-lunch/*
_supermarket/*
```

### Files for GitHub
```
README.md
LICENSE
CNAME
```

### Assets
```
assets/css
assets/images
assets/js
```

### Pages
```
index.html
organizations.md
resources.md
about.md
team.md
faqs.md
news.html
add.md
404.md
```

### Pages translated into Spanish
```
es/*
```

### Lists of locations
```
locations/*
community-garden/*
farmers-market/*
food-pantry/*
summer-lunch/*
supermarket/*
```

## How to add a new location

You can add a new location with the [add form](https://foodoasis.la/add/).

If you want to add a lot of new locations at once, these files may help…

```
_node/create-markdown.js
_node/update-markdown.js
```

The markdown files in these folders were initially generated by [Node.js](https://nodejs.org) from the data files in the `_data` folder.

```
_locations/*
_community-garden/*
_farmers-market/*
_food-pantry/*
_summer-lunch/*
_supermarket/*
```

They were created with `_node/create-markdown.js` and updated with `_node/update-markdown.js`, **but have since been edited by hand**.
