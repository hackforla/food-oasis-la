# KUDOS: https://github.com/bighairydave/jekyll-datalist/blob/master/_plugins/generator.rb
module Jekyll
  class SourceListGenerator < Generator
    def generate_one(site, data_name, type, type_uri)
      site.data[data_name].each do | food_source |
        food_source['type']     = type
        food_source['type_uri'] = type_uri
        food_source['uri'] = food_source['name'].downcase
                                                .gsub(" ", "-")
                                                .gsub("/", "-")
                                                .gsub("&", "-")
                                                .gsub(".", "-")
                                                .gsub("'", "")
                                                .gsub("--", "-")
        site.pages << SourcePage.new(site, "/", "#{ type_uri }/#{ food_source['uri'] }", food_source)
      end
    end
    def generate(site)
      generate_one(site, 'food_banks_andrew',        'Food Bank',        'food-bank')
      generate_one(site, 'community_gardens_andrew', 'Community Garden', 'community-garden')
      generate_one(site, 'farmers_markets_andrew',   'Farmers Market',   'farmers-market')
    end
  end

  class SourcePage < Page
    def initialize(site, base, dir, food_source)
      @site = site
      @base = base
      @dir = dir
      @name = 'index.html'
      self.process('index.html')
      self.read_yaml(File.join(base, '_layouts'), 'food-source.html')
      name_html  = food_source['name']
      name_words = food_source['name'].split(' ')

      # If there are at least three words
      if name_words.length >= 3

        # Wrap the last two words in a span
        name_words.insert(name_words.length - 2, '<span>')
        name_words.push('</span>')

        name_html = name_words.join(' ')
      end

      self.data['name_html'] = name_html.gsub('&', '&amp;') # TODO: Consider escaping < and > as well
      self.data['title'] = food_source['name']
      self.data['food_source'] = food_source
    end
  end

end
