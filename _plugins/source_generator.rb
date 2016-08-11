# KUDOS: https://github.com/bighairydave/jekyll-datalist/blob/master/_plugins/generator.rb
module Jekyll
  class SourceListGenerator < Generator
    def generate(site)
      site.data['food_banks_andrew'].each do | source |
        source['uri'] = source['name'].downcase.gsub(" ", "-").gsub("/", "-").gsub("&", "-").gsub(".", "-")
        site.pages << SourcePage.new(site, "/", "source/#{ source['uri'] }", source)
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
      self.read_yaml(File.join(base, '_layouts'), 'food-source.html')
      self.data['title'] = source['name']
      self.data['source'] = source
    end
  end

end
