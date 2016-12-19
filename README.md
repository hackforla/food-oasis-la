
# Food Oasis

This is a website with a map of food sources in Los Angeles, and list of resources about food deserts and health. You can view the site here…
https://foodoasis.la

## How to make changes

The website is published with [GitHub Pages](https://pages.github.com), and the files are generated with [Jekyll](http://jekyllrb.com).

To use Jekyll, you first need to [install Ruby and Jekyll](https://jekyllrb.com/docs/installation/).

### Step 1: Make your changes to the source code

a. Clone the `site` repository… [github.com/foodoasisla/site](https://github.com/foodoasisla/site)

b. Make your changes.

c. Commit and push your changes.

### Step 2: Generate the site with Jekyll

Run this command within your project folder…

```
jekyll build
```

Or, if you want to preview the site on your machine…

```
jekyll serve
```

And then visit… [http://localhost:4000](http://localhost:4000)

HINT: Building the files may be a slow process. If you’re not working on the list and detail pages, you can speed things up by running `rake build` or `rake serve` instead of `jekyll build` and `jekyll serve`. This will skip the list and detail pages, but builds all of the other files. (See the [rakefile](https://github.com/foodoasisla/site/blob/master/rakefile) for more details.)

### Step 3: Publish

When you generate the site, Jekyll creates a folder called `_site` within your project folder.

To publish your changes…

a. Clone the [foodoasisla.github.io](https://github.com/foodoasisla/foodoasisla.github.io) respository.

b. Overwrite those files with the contents of your `_site` folder.

c. Commit and push your changes.

And you’re done!

You can see your published changes at… https://foodoasis.la

HINT: You can save a step by pushing to the [foodoasisla.github.io](https://github.com/foodoasisla/foodoasisla.github.io) repository from your `_site` folder… [See step 11 in this Stack Overflow answer](https://stackoverflow.com/questions/28249255/how-do-i-configure-github-to-use-non-supported-jekyll-site-plugins?rq=1#answer-28252200).

## A summary of the project files

### Files for Jekyll
```
_config_dev.yml
_config.yml
_data/*
_drafts/*
_includes/*
_layouts/*
_plugins/*
rakefile
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

### Third-party assets
```
assets/leaflet
```

### Pages
```
index.html
organizations
resources
about
team
faqs
404.markdown
```

### Pages (Spanish)
```
es
```

### Maps
```
map/*
```

### Lists & detail pages
```
list/*
community-garden/*
farmers-market/*
food-pantry/*
```
