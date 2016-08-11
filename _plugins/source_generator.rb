# KUDOS: https://github.com/bighairydave/jekyll-datalist/blob/master/_plugins/generator.rb
module Jekyll
  class SourceListGenerator < Generator
    def generate(site)
      site.data['food_banks_andrew'].each do | source |
        site.pages << SourcePage.new(site, "/", "source/#{ source['name'].downcase.gsub(" ", "-").gsub("/", "-").gsub("&", "-") }", source)
      end
    end
  end

  class SourcePage < Page
    def initialize(site, base, dir, source)
      @site = site
      @base = base
      @dir = dir
      @name = 'index.html'
      self.process('index.html')
      self.read_yaml(base, 'food-source.html')
      self.data['title'] = source['name']
      self.data['source'] = source
    end
  end

end
